import { endTime } from "../utilities";
import { journeyRepository } from "../data-source";
import { logger } from "../../logger";
import { Router, Request, Response } from "express";
import app from "..";
const Joi = require("joi");

export const journeyRoutes = Router();

// returns total amount of journeys in the database

journeyRoutes.get("/total", async (req: Request, res: Response) => {
  const requestId = app.locals.requestId;
  const startTime = app.locals.startTime;
  try {
    const totalJourneys = await journeyRepository.count();
    res.status(200).json({
      totalJourneys,
    });
    return logger.info(`${requestId} Request 200 OK, ${endTime(startTime)} ms`);
  } catch (error) {
    res.status(503).json({
      error: "Service Unavailable.",
    });
    return logger.error(
      `${requestId} ${req.method} ${req.url} 503 Service Unavailable. ${endTime(
        startTime
      )} ms, ${error}`
    );
  }
});

// returns journeys by page number
journeyRoutes.get("/pages", async (req: Request, res: Response) => {
  const requestId = app.locals.requestId;
  const startTime = app.locals.startTime;
  try {
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
      return logger.warn(
        `${requestId} 400 Not a valid request. ${endTime(startTime)} ms,`
      );
    }
    // CALCULATE PAGINATION VALUES
    const pageSize = 30;
    const pageNumber = Math.ceil(Number(req.query.page));
    const skip = (pageNumber - 1) * pageSize;

    // GET THE TOTAL NUMBER OF JOURNEYS
    const totalJourneys = await journeyRepository.count();
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
      return logger.warn(
        `${requestId} 404 Record not found. ${endTime(startTime)} ms,`
      );
    }

    // PAGE RESPONSE
    res.status(200).json({
      journeys,
      pagination: {
        currentPage: pageNumber,
        pageSize,
        totalJourneys,
        totalPages: Math.ceil(totalJourneys / pageSize),
      },
    });
    return logger.info(`${requestId} Request 200 OK, ${endTime(startTime)} ms`);
  } catch (error) {
    res.status(503).json({
      error: "Service Unavailable.",
      requestQuery: req.query,
    });
    return logger.error(
      `${requestId} ${req.method} ${req.url} 503 Service Unavailable. ${endTime(
        startTime
      )} ms, ${error}`
    );
  }
});
