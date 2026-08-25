import { Router } from "express";
import {
    createExam,
    getAllExams,
    getExamById,
    updateExam,
    deleteExam,
    searchExams
} from "../controllers/exam.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createExamSchema, updateExamSchema } from "../validators/exam.validator.js";

const router = Router();

// public / any logged-in user
router.route("/getallexam").get(getAllExams);
router.route("/getexamByid/:examId").get(verifyJWT, getExamById);
router.route("/searchexam").get(verifyJWT, searchExams);

// admin-only
router.route("/exam-create").post(verifyJWT, isAdmin, validate(createExamSchema), createExam);
router.route("/updateexam/:examId").patch(verifyJWT, isAdmin,validate(updateExamSchema), updateExam);
router.route("/deleteexam/:examId").post(verifyJWT, isAdmin, deleteExam);

export default router;