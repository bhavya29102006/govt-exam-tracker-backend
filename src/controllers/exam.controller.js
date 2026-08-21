import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import jwt from "jsonwebtoken";
import { application } from "express";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Exam } from "../models/exams.models.js";

// POST /exam-create
const createExam = asyncHandler(async (req, res) => {
    const {
        examname,
        origanization,
        category,
        applicationStartdate,
        applicationlastdate,
        examdate,
        resultdate,
        officialwebsite,
        status
    } = req.body;

    if (
        [examname, origanization, category].some((field) => field?.trim() === "" || field === undefined)
    ) {
        throw new ApiError(400, "examname, origanization and category are required");
    }

    const existedExam = await Exam.findOne({
        examname,
        origanization
    });

    if (existedExam) {
        throw new ApiError(409, "an exam with this name and organization already exists");
    }

    const exam = await Exam.create({
        examname,
        origanization,
        category,
        applicationStartdate,
        applicationlastdate,
        examdate,
        resultdate,
        officialwebsite,
        status
    });

    const createdExam = await Exam.findById(exam._id);

    if (!createdExam) {
        throw new ApiError(500, "something went wrong while creating the exam");
    }

    return res
    .status(201)
    .json(new ApiResponse(201, createdExam, "exam created successfully"));
});

// GET /getallexam
const getAllExams = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, category, status } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const exams = await Exam.find(filter)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

    const totalExams = await Exam.countDocuments(filter);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                exams,
                totalExams,
                currentPage: Number(page),
                totalPages: Math.ceil(totalExams / Number(limit))
            },
            "exams fetched successfully"
        )
    );
});

// GET /getexamByid/:examId
const getExamById = asyncHandler(async (req, res) => {
    const { examId } = req.params;

    if (!examId) {
        throw new ApiError(400, "exam id is required");
    }

    const exam = await Exam.findById(examId);

    if (!exam) {
        throw new ApiError(404, "exam not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, exam, "exam fetched successfully"));
});

// PATCH /updateexam/:examId
const updateExam = asyncHandler(async (req, res) => {
    const { examId } = req.params;

    if (!examId) {
        throw new ApiError(400, "exam id is required");
    }

    const allowedUpdates = [
        "examname",
        "origanization",
        "category",
        "applicationStartdate",
        "applicationlastdate",
        "examdate",
        "resultdate",
        "officialwebsite",
        "status"
    ];

    const updates = {};
    for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
            updates[key] = req.body[key];
        }
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "at least one field is required to update");
    }

    const updatedExam = await Exam.findByIdAndUpdate(
        examId,
        { $set: updates },
        { new: true, runValidators: true }
    );

    if (!updatedExam) {
        throw new ApiError(404, "exam not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedExam, "exam updated successfully"));
});

// POST /deleteexam/:examId
const deleteExam = asyncHandler(async (req, res) => {
    const { examId } = req.params;

    if (!examId) {
        throw new ApiError(400, "exam id is required");
    }

    const deletedExam = await Exam.findByIdAndDelete(examId);

    if (!deletedExam) {
        throw new ApiError(404, "exam not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, deletedExam, "exam deleted successfully"));
});

// GET /searchexam?query=...
const searchExams = asyncHandler(async (req, res) => {
    const { query } = req.query;

    if (!query || query.trim() === "") {
        throw new ApiError(400, "search query is required");
    }

    const exams = await Exam.find({
        $or: [
            { examname: { $regex: query, $options: "i" } },
            { origanization: { $regex: query, $options: "i" } },
            { category: { $regex: query, $options: "i" } }
        ]
    });

    return res
    .status(200)
    .json(new ApiResponse(200, exams, `found ${exams.length} exam(s) matching "${query}"`));
});

export {
    createExam,
    getAllExams,
    getExamById,
    updateExam,
    deleteExam,
    searchExams
};