import AssignmentsDao from "./dao.js";

export default function AssignmentRoutes(app, db) {
  const dao = AssignmentsDao(db);

  const findAssignmentsForCourse = (req, res) => {
    const { courseId } = req.params;
    res.json(dao.findAssignmentsForCourse(courseId));
  };

  const findAssignmentById = (req, res) => {
    const assignment = dao.findAssignmentById(req.params.assignmentId);
    if (!assignment) {
      res.sendStatus(404);
      return;
    }
    res.json(assignment);
  };

  const createAssignmentForCourse = (req, res) => {
    const { courseId } = req.params;
    const assignment = { ...req.body, course: courseId };
    res.json(dao.createAssignment(assignment));
  };

  const updateAssignment = (req, res) => {
    const updatedAssignment = dao.updateAssignment(
      req.params.assignmentId,
      req.body
    );
    if (!updatedAssignment) {
      res.sendStatus(404);
      return;
    }
    res.json(updatedAssignment);
  };

  const deleteAssignment = (req, res) => {
    res.json(dao.deleteAssignment(req.params.assignmentId));
  };

  app.get("/api/courses/:courseId/assignments", findAssignmentsForCourse);
  app.post("/api/courses/:courseId/assignments", createAssignmentForCourse);
  app.get("/api/assignments/:assignmentId", findAssignmentById);
  app.put("/api/assignments/:assignmentId", updateAssignment);
  app.delete("/api/assignments/:assignmentId", deleteAssignment);
}
