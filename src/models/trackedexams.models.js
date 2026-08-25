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
reminderSent: {
    type: Boolean,
    default: false
},
reminderSent: {
    type: Boolean,
    default: false
},



},{timestamps:true})

export const TrackedExams = mongoose.model("TrackedExams",trackedExamSchema)