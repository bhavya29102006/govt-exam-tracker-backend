import mongoose from "mongoose";

const examschema = new mongoose.Schema({
    examname : {
        type:String,
        required:true,

    },
    origanization : {
        type:String,
         required:true,
    },

    category :{
        type:String,
         required:true,

    },
    applicationStartdate :{
        type:Date,
    },
    applicationlastdate :{
        type:Date,
    },

    examdate : {
        type:Date,
    },
    resultdate : {
        type:String,
    },
    officialwebsite : {
        type:String,
    },
    status: {
    type: String,
    enum: ["Upcoming", "Active", "Closed", "Result Declared"],
    default: "Upcoming"
}

},{imestamps: true})

export const Exam= mongoose.model("Exam",examschema)