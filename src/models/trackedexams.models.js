import mongoose from "mongoose";


const trackedExamSchema = new mongoose.Schema({
 user: {
   type: mongoose.Schema.Types.ObjectId,
   ref: "User",
   required:true
},
exam: {
   type: mongoose.Schema.Types.ObjectId,
   ref: "Exam",
   required:true
},
status: {
   type: String,
   enum: ["Interested", "Applied", "Exam Done", "Result Out"],
   default: "Interested"
},



},{timestamps:true})

export const TrackedExams = mongoose.model("TrackedExams",trackedExamSchema)