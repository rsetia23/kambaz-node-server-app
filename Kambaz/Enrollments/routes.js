import EnrollmentsDao from "./dao.js";

export default function EnrollmentRoutes(app, db) {
  const dao = EnrollmentsDao(db);

  const findEnrollmentsForCurrentUser = (req, res) => {
    const currentUser = req.session.currentUser;
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    res.json(dao.findEnrollmentsForUser(currentUser._id));
  };

  const enrollCurrentUserInCourse = (req, res) => {
    const currentUser = req.session.currentUser;
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    res.json(dao.enrollUserInCourse(currentUser._id, req.params.courseId));
  };

  const unenrollCurrentUserFromCourse = (req, res) => {
    const currentUser = req.session.currentUser;
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    res.json(dao.unenrollUserFromCourse(currentUser._id, req.params.courseId));
  };

  app.get("/api/users/current/enrollments", findEnrollmentsForCurrentUser);
  app.post("/api/users/current/enrollments/:courseId", enrollCurrentUserInCourse);
  app.delete(
    "/api/users/current/enrollments/:courseId",
    unenrollCurrentUserFromCourse
  );
}
