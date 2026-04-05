import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: String,
    value: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    questionId: String,
    correct: Boolean,
    awardedPoints: Number,
    submittedAnswer: mongoose.Schema.Types.Mixed,
    correctAnswer: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    _id: String,
    quiz: { type: String, required: true, ref: "QuizModel" },
    course: { type: String, required: true, ref: "CourseModel" },
    user: { type: String, required: true, ref: "UserModel" },
    answers: [answerSchema],
    questionResults: [resultSchema],
    score: { type: Number, default: 0 },
    possiblePoints: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
    attemptNumber: { type: Number, default: 1 },
  },
  { collection: "quiz_attempts" }
);

export default quizAttemptSchema;
