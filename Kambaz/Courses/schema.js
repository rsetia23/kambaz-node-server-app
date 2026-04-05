import mongoose from "mongoose";
import moduleSchema from "../Modules/schema.js";

const courseSchema = new mongoose.Schema(
  {
    _id: String,
    name: String,
    number: String,
    startDate: String,
    endDate: String,
    department: String,
    credits: Number,
    description: String,
    image: String,
    author: String,
    modules: [moduleSchema],
  },
  { collection: "courses" }
);

export default courseSchema;
