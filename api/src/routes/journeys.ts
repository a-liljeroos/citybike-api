import { journeyRepository } from "../data-source";
import { routeLogger } from "../../logger";
import { Router, Request, Response } from "express";
import { verifyToken } from "../jsonwebtoken";
import app from "..";
const Joi = require("joi");

export const journeyRoutes = Router();

// returns total amount of journeys in the database

journeyRoutes.get("/total", async (req: Request, res: Response) => {
  const requestId = app.locals.requestId;
  const startTime = app.locals.startTime;

  try {
    //
    const totalJourneys = await journeyRepository.count();

    res.status(200).json({
      totalJourneys,
    });

    return routeLogger.response200(requestId, startTime);
    //
  } catch (error) {
    res.status(503).json({
      error: "Service Unavailable.",
    });

    return routeLogger.response503(requestId, startTime, req, {
      error: error.stack,
    });
  }
});

// returns journeys by page number

journeyRoutes.get("/pages", async (req: Request, res: Response) => {
  const requestId = app.locals.requestId;
  const startTime = app.locals.startTime;

  try {
    //
    verifyToken(req.headers["x-access-token"] as string);
    //
  } catch (error) {
    res.status(401).json({ error: "Unauthorized." });
    return routeLogger.response401(requestId, startTime, req, {
      error: error,
    });
  }

  try {
    //
    const schema = Joi.object().keys({
      page: Joi.number().min(1).required(),
    });

    if (schema.validate(req.query).error) {
      res.status(400).json({
        error: "Not a valid request.",
        message: "The request query does not match the expected schema.",
        requestQuery: req.query,
        correctExample: { page: 1 },
      });
      return routeLogger.response400(requestId, startTime, req, {
        error: schema.validate(req.query).error.stack,
      });
    }
    // CALCULATE PAGINATION VALUES
    const pageSize = 30;
    const pageNumber = Math.ceil(Number(req.query.page));
    const skip = (pageNumber - 1) * pageSize;

    // FIND THE JOURNEYS FOR THE GIVEN PAGE
    const journeys = await journeyRepository.find({
      skip,
      take: pageSize,
    });

    if (journeys.length === 0) {
      res.status(404).json({
        error: "Record not found.",
        requestQuery: req.query,
      });
      return routeLogger.response404(requestId, startTime, req, {
        journeys: journeys,
      });
    }

    // PAGE RESPONSE
    res.status(200).json({
      journeys,
      pagination: {
        currentPage: pageNumber,
        pageSize,
      },
    });

    return routeLogger.response200(requestId, startTime);
    //
  } catch (error) {
    res.status(503).json({
      error: "Service Unavailable.",
      requestQuery: req.query,
    });
    return routeLogger.response503(requestId, startTime, req, {
      error: error.stack,
    });
  }
});
