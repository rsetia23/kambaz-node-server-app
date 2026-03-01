import { v4 as uuidv4 } from "uuid";

export default function EnrollmentsDao(db) {
  function findEnrollmentsForUser(userId) {
    return db.enrollments.filter((enrollment) => enrollment.user === userId);
  }

  function enrollUserInCourse(userId, courseId) {
    const existingEnrollment = db.enrollments.find(
      (enrollment) =>
        enrollment.user === userId && enrollment.course === courseId
    );
    if (existingEnrollment) return existingEnrollment;
    const enrollment = { _id: uuidv4(), user: userId, course: courseId };
    db.enrollments.push(enrollment);
    return enrollment;
  }

  function unenrollUserFromCourse(userId, courseId) {
    const beforeCount = db.enrollments.length;
    db.enrollments = db.enrollments.filter(
      (enrollment) =>
        !(enrollment.user === userId && enrollment.course === courseId)
    );
    return beforeCount !== db.enrollments.length;
  }

  return {
    findEnrollmentsForUser,
    enrollUserInCourse,
    unenrollUserFromCourse,
  };
}
