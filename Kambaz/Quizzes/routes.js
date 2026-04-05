import QuizzesDao from "./dao.js";
import QuizAttemptsDao from "../QuizAttempts/dao.js";

const normalizeText = (value) => `${value ?? ""}`.trim().toLowerCase();

const serializeQuiz = (quiz, latestAttempt = null, attemptsUsed = 0) => {
  if (!quiz) return null;
  const object = quiz.toObject ? quiz.toObject() : quiz;
  return {
    ...object,
    latestAttempt,
    attemptsUsed,
    questionCount: object.questions?.length || 0,
  };
};

const buildCorrectAnswer = (question) => {
  if (question.type === "TRUE_FALSE") return Boolean(question.trueFalseAnswer);
  if (question.type === "FILL_IN_THE_BLANK") return question.blankAnswers || [];
  return (question.choices || []).find((choice) => choice.correct)?._id || "";
};

const gradeQuiz = (quiz, answers = []) => {
  const answersByQuestionId = new Map(
    (answers || []).map((answer) => [answer.questionId, answer.value])
  );

  const questionResults = (quiz.questions || []).map((question) => {
    const submittedAnswer = answersByQuestionId.get(question._id);
    let correct = false;

    if (question.type === "TRUE_FALSE") {
      correct = Boolean(submittedAnswer) === Boolean(question.trueFalseAnswer);
    } else if (question.type === "FILL_IN_THE_BLANK") {
      correct = (question.blankAnswers || []).some(
        (answer) => normalizeText(answer) === normalizeText(submittedAnswer)
      );
    } else {
      correct =
        normalizeText(submittedAnswer) ===
        normalizeText((question.choices || []).find((choice) => choice.correct)?._id);
    }

    return {
      questionId: question._id,
      correct,
      awardedPoints: correct ? Number(question.points) || 0 : 0,
      submittedAnswer,
      correctAnswer: buildCorrectAnswer(question),
    };
  });

  return {
    questionResults,
    score: questionResults.reduce(
      (total, result) => total + (Number(result.awardedPoints) || 0),
      0
    ),
    possiblePoints: Number(quiz.points) || 0,
  };
};

export default function QuizRoutes(app) {
  const dao = QuizzesDao();
  const attemptsDao = QuizAttemptsDao();

  const requireCurrentUser = (req, res) => {
    const currentUser = req.session.currentUser;
    if (!currentUser) {
      res.sendStatus(401);
      return null;
    }
    return currentUser;
  };

  const requireFaculty = (req, res) => {
    const currentUser = requireCurrentUser(req, res);
    if (!currentUser) return null;
    if (currentUser.role !== "FACULTY" && currentUser.role !== "ADMIN") {
      res.sendStatus(403);
      return null;
    }
    return currentUser;
  };

  const findQuizzesForCourse = async (req, res) => {
    const currentUser = req.session.currentUser;
    const quizzes = await dao.findQuizzesForCourse(req.params.courseId);
    const visibleQuizzes =
      currentUser && (currentUser.role === "FACULTY" || currentUser.role === "ADMIN")
        ? quizzes
        : quizzes.filter((quiz) => quiz.published);

    const serialized = await Promise.all(
      visibleQuizzes.map(async (quiz) => {
        if (!currentUser) return serializeQuiz(quiz);
        const [latestAttempt, attemptsUsed] = await Promise.all([
          attemptsDao.findLatestAttemptForUser(quiz._id, currentUser._id),
          attemptsDao.countAttemptsForUser(quiz._id, currentUser._id),
        ]);
        return serializeQuiz(quiz, latestAttempt, attemptsUsed);
      })
    );

    res.json(serialized);
  };

  const findQuizById = async (req, res) => {
    const currentUser = req.session.currentUser;
    const quiz = await dao.findQuizById(req.params.quizId);
    if (!quiz) {
      res.sendStatus(404);
      return;
    }
    if (
      !quiz.published &&
      (!currentUser || (currentUser.role !== "FACULTY" && currentUser.role !== "ADMIN"))
    ) {
      res.sendStatus(403);
      return;
    }
    let latestAttempt = null;
    let attemptsUsed = 0;
    if (currentUser) {
      [latestAttempt, attemptsUsed] = await Promise.all([
        attemptsDao.findLatestAttemptForUser(quiz._id, currentUser._id),
        attemptsDao.countAttemptsForUser(quiz._id, currentUser._id),
      ]);
    }
    res.json(serializeQuiz(quiz, latestAttempt, attemptsUsed));
  };

  const createQuizForCourse = async (req, res) => {
    const currentUser = requireFaculty(req, res);
    if (!currentUser) return;
    const quiz = await dao.createQuiz(req.params.courseId, req.body);
    res.json(quiz);
  };

  const updateQuiz = async (req, res) => {
    const currentUser = requireFaculty(req, res);
    if (!currentUser) return;
    const updatedQuiz = await dao.updateQuiz(req.params.quizId, req.body);
    if (!updatedQuiz) {
      res.sendStatus(404);
      return;
    }
    res.json(updatedQuiz);
  };

  const deleteQuiz = async (req, res) => {
    const currentUser = requireFaculty(req, res);
    if (!currentUser) return;
    await attemptsDao.deleteAttemptsForQuiz(req.params.quizId);
    const deletedQuiz = await dao.deleteQuiz(req.params.quizId);
    res.json(deletedQuiz);
  };

  const submitAttempt = async (req, res) => {
    const currentUser = requireCurrentUser(req, res);
    if (!currentUser) return;
    if (currentUser.role === "FACULTY" || currentUser.role === "ADMIN") {
      res.status(400).json({ message: "Faculty preview attempts are not persisted." });
      return;
    }

    const quiz = await dao.findQuizById(req.params.quizId);
    if (!quiz || !quiz.published) {
      res.sendStatus(404);
      return;
    }

    const attemptsUsed = await attemptsDao.countAttemptsForUser(quiz._id, currentUser._id);
    const maxAttempts = quiz.multipleAttempts ? quiz.howManyAttempts : 1;
    if (attemptsUsed >= maxAttempts) {
      res.status(400).json({ message: "No attempts remaining." });
      return;
    }

    if (quiz.accessCode && normalizeText(req.body.accessCode) !== normalizeText(quiz.accessCode)) {
      res.status(400).json({ message: "Invalid access code." });
      return;
    }

    const grading = gradeQuiz(quiz, req.body.answers || []);
    const savedAttempt = await attemptsDao.createAttempt({
      quiz: quiz._id,
      course: quiz.course,
      user: currentUser._id,
      answers: req.body.answers || [],
      questionResults: grading.questionResults,
      score: grading.score,
      possiblePoints: grading.possiblePoints,
      attemptNumber: attemptsUsed + 1,
    });

    res.json(savedAttempt);
  };

  const findLatestAttempt = async (req, res) => {
    const currentUser = requireCurrentUser(req, res);
    if (!currentUser) return;
    const latestAttempt = await attemptsDao.findLatestAttemptForUser(
      req.params.quizId,
      currentUser._id
    );
    if (!latestAttempt) {
      res.sendStatus(404);
      return;
    }
    res.json(latestAttempt);
  };

  app.get("/api/courses/:courseId/quizzes", findQuizzesForCourse);
  app.post("/api/courses/:courseId/quizzes", createQuizForCourse);
  app.get("/api/quizzes/:quizId", findQuizById);
  app.put("/api/quizzes/:quizId", updateQuiz);
  app.delete("/api/quizzes/:quizId", deleteQuiz);
  app.get("/api/quizzes/:quizId/attempts/latest", findLatestAttempt);
  app.post("/api/quizzes/:quizId/attempts", submitAttempt);
}
