import mongoose from "mongoose";
import Evaluation from "../models/evaluation.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const STAFF_ROLES = ["admin", "super_admin"];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createEvaluation = asyncHandler(async (req, res) => {
  const evaluator = req.user._id;
  const { subjectType, subject, context, ratings, overallRating, strengths, weaknesses, notes, recommendation, status } = req.body;

  if (!isValidObjectId(subject)) {
    throw new ApiError(400, "Invalid subject ID");
  }

  const duplicate = await Evaluation.findOne({
    evaluator,
    subjectType,
    subject,
    "context.ref": context?.ref || null,
    status: { $in: ["draft", "submitted"] },
  });
  if (duplicate) {
    throw new ApiError(
      409,
      "You have already evaluated this subject. Update the existing evaluation instead."
    );
  }

  const evaluation = await Evaluation.create({
    evaluator,
    evaluatorRole: req.user.role || null,
    subjectType,
    subject,
    context: {
      type: context?.type || "general",
      ref: context?.ref || null,
      title: context?.title || null,
    },
    ratings: ratings || [],
    overallRating,
    strengths: strengths || [],
    weaknesses: weaknesses || [],
    notes: notes || null,
    recommendation: recommendation || "neutral",
    status: status || "submitted",
  });

  res
    .status(201)
    .json(new ApiResponse(201, evaluation, "Evaluation created successfully"));
});

export const getMyEvaluations = asyncHandler(async (req, res) => {
  const evaluator = req.user._id;
  const { subjectType, status, page = 1, limit = 20 } = req.query;

  const filter = { evaluator };
  if (subjectType) filter.subjectType = subjectType;
  if (status) filter.status = status;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const [evaluations, total] = await Promise.all([
    Evaluation.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Evaluation.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        evaluations,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
      "Evaluations fetched successfully"
    )
  );
});

export const getEvaluationsBySubject = asyncHandler(async (req, res) => {
  const { subjectType, subject } = req.params;
  const { status = "submitted", page = 1, limit = 20 } = req.query;

  if (!isValidObjectId(subject)) {
    throw new ApiError(400, "Invalid subject ID");
  }

  const filter = { subjectType, subject };
  if (status) filter.status = status;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const [evaluations, total] = await Promise.all([
    Evaluation.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("evaluator", "name email role"),
    Evaluation.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        evaluations,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
      "Evaluations fetched successfully"
    )
  );
});

export const getEvaluationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid evaluation ID");

  const evaluation = await Evaluation.findById(id).populate(
    "evaluator",
    "name email role"
  );
  if (!evaluation) throw new ApiError(404, "Evaluation not found");

  res
    .status(200)
    .json(new ApiResponse(200, evaluation, "Evaluation fetched successfully"));
});

export const updateEvaluation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid evaluation ID");

  const evaluation = await Evaluation.findById(id);
  if (!evaluation) throw new ApiError(404, "Evaluation not found");

  const isOwner = String(evaluation.evaluator) === String(req.user._id);
  const isStaff = STAFF_ROLES.includes(req.user.role);
  if (!isOwner && !isStaff) {
    throw new ApiError(403, "You can only update your own evaluations");
  }

  const allowed = ["context", "ratings", "overallRating", "strengths", "weaknesses", "notes", "recommendation", "status"];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      evaluation[key] = req.body[key];
    }
  }

  await evaluation.save();

  res
    .status(200)
    .json(new ApiResponse(200, evaluation, "Evaluation updated successfully"));
});

export const deleteEvaluation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid evaluation ID");

  const evaluation = await Evaluation.findById(id);
  if (!evaluation) throw new ApiError(404, "Evaluation not found");

  const isOwner = String(evaluation.evaluator) === String(req.user._id);
  const isStaff = STAFF_ROLES.includes(req.user.role);
  if (!isOwner && !isStaff) {
    throw new ApiError(403, "You can only delete your own evaluations");
  }

  await evaluation.deleteOne();

  res
    .status(200)
    .json(new ApiResponse(200, null, "Evaluation deleted successfully"));
});

export const getSubjectRatingStats = asyncHandler(async (req, res) => {
  const { subjectType, subject } = req.params;
  if (!isValidObjectId(subject)) {
    throw new ApiError(400, "Invalid subject ID");
  }

  const match = { subjectType, subject, status: "submitted" };

  const [aggregation, counts] = await Promise.all([
    Evaluation.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          avgOverall: { $avg: "$overallRating" },
          count: { $sum: 1 },
          sumOverall: { $sum: "$overallRating" },
        },
      },
    ]),
    Evaluation.aggregate([
      { $match: match },
      { $group: { _id: "$recommendation", count: { $sum: 1 } } },
    ]),
  ]);

  const summary = aggregation[0] || { avgOverall: 0, count: 0, sumOverall: 0 };
  const recommendationDistribution = Object.fromEntries(
    counts.map((c) => [c._id, c.count])
  );

  const topCategories = await Evaluation.aggregate([
    { $match: match },
    { $unwind: "$ratings" },
    {
      $group: {
        _id: "$ratings.category",
        avgScore: { $avg: "$ratings.score" },
        count: { $sum: 1 },
      },
    },
    { $sort: { avgScore: -1 } },
    { $limit: 10 },
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        subjectType,
        subject,
        averageRating: summary.avgOverall,
        totalEvaluations: summary.count,
        recommendationDistribution,
        topCategories,
      },
      "Rating stats fetched successfully"
    )
  );
});
