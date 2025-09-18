import express from "express";

import {
  createAbout,
  getAbouts,
  getAboutById,
  updateAboutById,
  patchAboutById,
  deleteAboutById,
} from "../controllers/about.controller.js";

import {
  createAboutSchema,
  putAboutSchema,
  patchAboutSchema,
  listQuerySchema,
  idParamSchema,
} from "../validators/about.validation.js";

import validate, {
  validateQuery,
} from "../middleware/validation.middleware.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import playerModel from "../models/player.model.js";
import sportModel from "../models/sport.model.js";

const aboutsRouter = express.Router();

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

aboutsRouter.get(
  "/",
  validateQuery(listQuerySchema),
  async (req, res, next) => {
    try {
      const { page, limit } = req.query;
      const result = await getAbouts({ page, limit });
      const [totalPlayers, totalCoach, totalSports] = [
        await playerModel.countDocuments({ jop: "player" }),
        await playerModel.countDocuments({ jop: "coach" }),
        await sportModel.countDocuments(),
      ];
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            result,
            { totalPlayers, totalCoach, totalSports },
            "About docs fetched successfully"
          )
        );
    } catch (err) {
      next(err);
    }
  }
);

aboutsRouter.post("/", validate(createAboutSchema), async (req, res, next) => {
  try {
    const created = await createAbout(req.body);
    return res
      .status(201)
      .json(new ApiResponse(201, created, "About created successfully"));
  } catch (err) {
    next(err);
  }
});

aboutsRouter.put(
  "/:id",
  validateParams(idParamSchema),
  validate(putAboutSchema),
  async (req, res, next) => {
    try {
      const updated = await updateAboutById(req.params.id, req.body);
      if (!updated) return next(new ApiError(404, "About not found"));
      return res
        .status(200)
        .json(new ApiResponse(200, updated, "About updated successfully"));
    } catch (err) {
      next(err);
    }
  }
);

aboutsRouter.patch(
  "/:id",
  validateParams(idParamSchema),
  validate(patchAboutSchema),
  async (req, res, next) => {
    try {
      const updated = await patchAboutById(req.params.id, req.body);
      if (!updated) return next(new ApiError(404, "About not found"));
      return res
        .status(200)
        .json(new ApiResponse(200, updated, "About patched successfully"));
    } catch (err) {
      next(err);
    }
  }
);

aboutsRouter.delete(
  "/:id",
  validateParams(idParamSchema),
  async (req, res, next) => {
    try {
      const deleted = await deleteAboutById(req.params.id);
      if (!deleted) return next(new ApiError(404, "About not found"));
      return res
        .status(200)
        .json(new ApiResponse(200, { id: deleted._id }, "About deleted"));
    } catch (err) {
      next(err);
    }
  }
);

export default aboutsRouter;
