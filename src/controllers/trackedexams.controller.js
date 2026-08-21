import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { TrackedExams } from "../models/trackedexams.models.js";
import { Exam } from "../models/exams.models.js";

// POST /track/:examId
const trackExam = asyncHandler(async (req, res) => {
    const { examId } = req.params;

    if (!examId) {
        throw new ApiError(400, "exam id is required");
    }

    const exam = await Exam.findById(examId);

    if (!exam) {
        throw new ApiError(404, "exam not found");
    }

    const alreadyTracked = await TrackedExams.findOne({
        user: req.user._id,
        exam: examId
    });

    if (alreadyTracked) {
        throw new ApiError(409, "you are already tracking this exam");
    }

    const trackedExam = await TrackedExams.create({
        user: req.user._id,
        exam: examId
    });

    return res
    .status(201)
    .json(new ApiResponse(201, trackedExam, "exam tracked successfully"));
});

// POST /untrack/:examId
const untrackExam = asyncHandler(async (req, res) => {
    const { examId } = req.params;

    if (!examId) {
        throw new ApiError(400, "exam id is required");
    }

    const deletedTrackedExam = await TrackedExams.findOneAndDelete({
        user: req.user._id,
        exam: examId
    });

    if (!deletedTrackedExam) {
        throw new ApiError(404, "you are not tracking this exam");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, deletedTrackedExam, "exam untracked successfully"));
});

// GET /my-tracked-exams
const getMyTrackedExams = asyncHandler(async (req, res) => {
    const { status } = req.query;

    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const trackedExams = await TrackedExams.find(filter)
        .populate("exam")
        .sort({ createdAt: -1 });

    return res
    .status(200)
    .json(new ApiResponse(200, trackedExams, "tracked exams fetched successfully"));
});

// PATCH /track/:examId/status
const updateTrackedStatus = asyncHandler(async (req, res) => {
    const { examId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Interested", "Applied", "Exam Done", "Result Out"];

    if (!status || !allowedStatuses.includes(status)) {
        throw new ApiError(400, `status must be one of: ${allowedStatuses.join(", ")}`);
    }

    const trackedExam = await TrackedExams.findOneAndUpdate(
        { user: req.user._id, exam: examId },
        { $set: { status } },
        { new: true, runValidators: true }
    ).populate("exam");

    if (!trackedExam) {
        throw new ApiError(404, "you are not tracking this exam");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, trackedExam, "tracked exam status updated successfully"));
});

export {
    trackExam,
    untrackExam,
    getMyTrackedExams,
    updateTrackedStatus
};