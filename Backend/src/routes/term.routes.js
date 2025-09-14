// routes/term.routes.js
import express from "express";

import {
  createTerm,
  getTerms,
  getTermById,
  updateTermById,
  patchTermById,
  deleteTermById,
} from "../controllers/term.controller.js";

import {
  createTermSchema,
  putTermSchema,
  patchTermSchema,
  listQuerySchema,
  idParamSchema,
} from "../validators/term.validation.js";

// ⬇️ use YOUR middlewares and response/error classes
import validate, { validateQuery } from "../middleware/validation.middleware.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const termsRouter = express.Router();

const validateParams = (schema) => {
  return (req, _res, next) => {
    const { value, error } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = {};
      for (const err of error.details) {
        const key = err.path.join(".");
        if (!errors[key]) errors[key] = [];
        errors[key].push(err.message);
      }
      return next(new ApiError(400, "Params Validation Error", true, errors));
    }

    req.params = value;
    next();
  };
};

termsRouter.get("/", validateQuery(listQuerySchema), async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await getTerms({ page, limit });
    return res
      .status(200)
      .json(new ApiResponse(200, result, "Terms fetched successfully"));
  } catch (err) {
    next(err);
  }
});


// POST /terms
termsRouter.post(
  "/",
  validate(createTermSchema), // uses YOUR body validator
  async (req, res, next) => {
    try {
      const created = await createTerm(req.body);
      return res
        .status(201)
        .json(new ApiResponse(201, created, "Term created successfully"));
    } catch (err) {
      next(err);
    }
  }
);

// PUT /terms/:id
termsRouter.put(
  "/:id",
  validateParams(idParamSchema),
  validate(putTermSchema),
  async (req, res, next) => {
    try {
      const updated = await updateTermById(req.params.id, req.body);
      if (!updated) return next(new ApiError(404, "Term not found"));
      return res
        .status(200)
        .json(new ApiResponse(200, updated, "Term updated successfully"));
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /terms/:id
termsRouter.patch(
  "/:id",
  validateParams(idParamSchema),
  validate(patchTermSchema),
  async (req, res, next) => {
    try {
      const updated = await patchTermById(req.params.id, req.body);
      if (!updated) return next(new ApiError(404, "Term not found"));
      return res
        .status(200)
        .json(new ApiResponse(200, updated, "Term patched successfully"));
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /terms/:id
termsRouter.delete(
  "/:id",
  validateParams(idParamSchema),
  async (req, res, next) => {
    try {
      const deleted = await deleteTermById(req.params.id);
      if (!deleted) return next(new ApiError(404, "Term not found"));
      return res
        .status(200)
        .json(new ApiResponse(200, { id: deleted._id }, "Term deleted"));
    } catch (err) {
      next(err);
    }
  }
);

export default termsRouter;
