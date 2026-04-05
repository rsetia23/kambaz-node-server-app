import Database from "./Database/index.js";
import UserRoutes from "./Users/routes.js";
import CourseRoutes from "./Courses/routes.js";
import ModulesRoutes from "./Modules/routes.js";
import AssignmentRoutes from "./Assignments/routes.js";
import EnrollmentRoutes from "./Enrollments/routes.js";
import QuizRoutes from "./Quizzes/routes.js";

export default function Kambaz(app) {
  UserRoutes(app, Database);
  CourseRoutes(app, Database);
  ModulesRoutes(app, Database);
  AssignmentRoutes(app, Database);
  EnrollmentRoutes(app, Database);
  QuizRoutes(app, Database);
}
