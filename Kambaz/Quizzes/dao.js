import { v4 as uuidv4 } from "uuid";
import model from "./model.js";

const computePoints = (questions = []) =>
  questions.reduce((total, question) => total + (Number(question.points) || 0), 0);

const normalizeQuestion = (question = {}) => {
  const type = question.type || "MULTIPLE_CHOICE";
  const base = {
    _id: question._id || uuidv4(),
    title: question.title || "Untitled Question",
    type,
    points: Number(question.points) || 0,
    questionText: question.questionText || "",
  };

  if (type === "TRUE_FALSE") {
    return {
      ...base,
      trueFalseAnswer: Boolean(question.trueFalseAnswer),
      choices: [],
      blankAnswers: [],
    };
  }

  if (type === "FILL_IN_THE_BLANK") {
    return {
      ...base,
      blankAnswers: (question.blankAnswers || [])
        .map((answer) => `${answer}`.trim())
        .filter(Boolean),
      choices: [],
      trueFalseAnswer: false,
    };
  }

  const choices = (question.choices || []).map((choice) => ({
    _id: choice._id || uuidv4(),
    text: choice.text || "",
    correct: Boolean(choice.correct),
  }));

  return {
    ...base,
    choices,
    trueFalseAnswer: false,
    blankAnswers: [],
  };
};

const normalizeQuiz = (quiz = {}, courseId) => {
  const questions = (quiz.questions || []).map(normalizeQuestion);
  return {
    _id: quiz._id || uuidv4(),
    course: courseId || quiz.course,
    title: quiz.title || "New Quiz",
    description: quiz.description || "",
    quizType: quiz.quizType || "GRADED_QUIZ",
    points: computePoints(questions),
    assignmentGroup: quiz.assignmentGroup || "QUIZZES",
    shuffleAnswers:
      typeof quiz.shuffleAnswers === "boolean" ? quiz.shuffleAnswers : true,
    timeLimit: Number(quiz.timeLimit) || 20,
    multipleAttempts: Boolean(quiz.multipleAttempts),
    howManyAttempts: Math.max(1, Number(quiz.howManyAttempts) || 1),
    showCorrectAnswers: quiz.showCorrectAnswers || "AFTER_SUBMISSION",
    accessCode: quiz.accessCode || "",
    oneQuestionAtATime:
      typeof quiz.oneQuestionAtATime === "boolean" ? quiz.oneQuestionAtATime : true,
    webcamRequired: Boolean(quiz.webcamRequired),
    lockQuestionsAfterAnswering: Boolean(quiz.lockQuestionsAfterAnswering),
    dueDate: quiz.dueDate || "",
    availableDate: quiz.availableDate || "",
    untilDate: quiz.untilDate || "",
    published: Boolean(quiz.published),
    questions,
  };
};

export default function QuizzesDao() {
  const findQuizzesForCourse = (courseId) =>
    model.find({ course: courseId }).sort({ dueDate: 1, title: 1 });

  const findQuizById = (quizId) => model.findById(quizId);

  const createQuiz = (courseId, quiz = {}) => {
    const newQuiz = normalizeQuiz(quiz, courseId);
    return model.create(newQuiz);
  };

  const updateQuiz = (quizId, quizUpdates = {}) => {
    const normalizedQuiz = normalizeQuiz(quizUpdates, quizUpdates.course);
    return model.findByIdAndUpdate(
      quizId,
      { $set: { ...normalizedQuiz, _id: quizId } },
      { new: true }
    );
  };

  const deleteQuiz = (quizId) => model.findByIdAndDelete(quizId);

  return {
    findQuizzesForCourse,
    findQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
  };
}
