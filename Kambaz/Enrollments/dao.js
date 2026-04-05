import model from "./model.js";

export default function EnrollmentsDao(db) {
  function findEnrollmentsForUser(userId) {
    return model.find({ user: userId });
  }

  async function findCoursesForUser(userId) {
    const enrollments = await model.find({ user: userId }).populate("course");
    return enrollments.map((enrollment) => enrollment.course);
  }

  async function findUsersForCourse(courseId) {
    const enrollments = await model.find({ course: courseId }).populate("user");
    return enrollments.map((enrollment) => enrollment.user);
  }

  function enrollUserInCourse(userId, courseId) {
    return model.findOneAndUpdate(
      { user: userId, course: courseId },
      {
        $setOnInsert: {
          _id: `${userId}-${courseId}`,
          user: userId,
          course: courseId,
        },
      },
      { new: true, upsert: true }
    );
  }

  function unenrollUserFromCourse(userId, courseId) {
    return model.deleteOne({ user: userId, course: courseId });
  }

  function unenrollAllUsersFromCourse(courseId) {
    return model.deleteMany({ course: courseId });
  }

  return {
    findEnrollmentsForUser,
    findCoursesForUser,
    findUsersForCourse,
    enrollUserInCourse,
    unenrollUserFromCourse,
    unenrollAllUsersFromCourse,
  };
}
