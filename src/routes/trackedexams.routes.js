import { Router } from "express";
import {
    trackExam,
    untrackExam,
    getMyTrackedExams,
    updateTrackedStatus
} from "../controllers/trackedexams.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/track/:examId").post(verifyJWT, trackExam);
router.route("/untrack/:examId").post(verifyJWT, untrackExam);
router.route("/my-tracked-exams").get(verifyJWT, getMyTrackedExams);
router.route("/track/:examId/status").patch(verifyJWT, updateTrackedStatus);

export default router;