import { v4 as uuidv4 } from "uuid";
import model from "../Courses/model.js";

export default function ModulesDao(db) {
  async function updateModule(courseId, moduleId, moduleUpdates) {
    const course = await model.findById(courseId);
    if (!course) return null;
    const module = course.modules.id(moduleId);
    if (!module) return null;
    module.set(moduleUpdates);
    await course.save();
    return module;
  }

  async function deleteModule(courseId, moduleId) {
    return model.updateOne(
      { _id: courseId },
      { $pull: { modules: { _id: moduleId } } }
    );
  }

  async function createModule(courseId, module) {
    const newModule = { ...module, _id: uuidv4(), lessons: module.lessons || [] };
    await model.updateOne({ _id: courseId }, { $push: { modules: newModule } });
    return newModule;
  }

  async function findModulesForCourse(courseId) {
    const course = await model.findById(courseId);
    return course?.modules || [];
  }

  return {
    updateModule,
    deleteModule,
    createModule,
    findModulesForCourse,
  };
}
