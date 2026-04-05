import EnrollmentsDao from "./dao.js";

export default function EnrollmentRoutes(app, db) {
  const dao = EnrollmentsDao(db);

  const findEnrollmentsForCurrentUser = async (req, res) => {
    const currentUser = req.session.currentUser;
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    const enrollments = await dao.findEnrollmentsForUser(currentUser._id);
    res.json(enrollments);
  };

  const enrollCurrentUserInCourse = async (req, res) => {
    const currentUser = req.session.currentUser;
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    const enrollment = await dao.enrollUserInCourse(
      currentUser._id,
      req.params.courseId
    );
    res.json(enrollment);
  };

  const unenrollCurrentUserFromCourse = async (req, res) => {
    const currentUser = req.session.currentUser;
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    const status = await dao.unenrollUserFromCourse(
      currentUser._id,
      req.params.courseId
    );
    res.json(status);
  };

  app.get("/api/users/current/enrollments", findEnrollmentsForCurrentUser);
  app.post("/api/users/current/enrollments/:courseId", enrollCurrentUserInCourse);
  app.delete(
    "/api/users/current/enrollments/:courseId",
    unenrollCurrentUserFromCourse
  );
}
