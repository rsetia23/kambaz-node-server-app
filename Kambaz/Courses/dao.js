import { v4 as uuidv4 } from "uuid";

export default function CoursesDao(db) {
  function findAllCourses() {
    return db.courses;
  }

  function findCoursesForEnrolledUser(userId) {
    const enrolledCourseIds = db.enrollments
      .filter((enrollment) => enrollment.user === userId)
      .map((enrollment) => enrollment.course);
    return db.courses.filter((course) => enrolledCourseIds.includes(course._id));
  }

  function createCourse(course) {
    const newCourse = { ...course, _id: uuidv4() };
    db.courses = [...db.courses, newCourse];
    return newCourse;
  }

  return { findAllCourses, findCoursesForEnrolledUser, createCourse };
}
