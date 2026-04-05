import { v4 as uuidv4 } from "uuid";
import model from "./model.js";

export default function QuizAttemptsDao() {
  const findLatestAttemptForUser = (quizId, userId) =>
    model.findOne({ quiz: quizId, user: userId }).sort({ submittedAt: -1 });

  const countAttemptsForUser = (quizId, userId) =>
    model.countDocuments({ quiz: quizId, user: userId });

  const createAttempt = (attempt) =>
    model.create({ ...attempt, _id: attempt._id || uuidv4() });

  const deleteAttemptsForQuiz = (quizId) => model.deleteMany({ quiz: quizId });

  return {
    findLatestAttemptForUser,
    countAttemptsForUser,
    createAttempt,
    deleteAttemptsForQuiz,
  };
}
