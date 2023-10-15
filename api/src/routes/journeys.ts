import { Router, Request, Response } from "express";
import { journeyRepository } from "../data-source";

const Joi = require("joi");

export const journeyRoutes = Router();

// returns journeys by page number
journeyRoutes.get("/pages", async (req: Request, res: Response) => {
  const schema = Joi.object().keys({
    page: Joi.number().min(1).required(),
  });

  if (schema.validate(req.query).error) {
    return res.status(400).json({
      error: "Not a valid request.",
      message: "The request query does not match the expected schema.",
      requestQuery: req.query,
      correctExample: { page: 1 },
    });
  }

  try {
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
      return res.status(404).json({
        error: "Record not found.",
        requestQuery: req.query,
      });
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
  } catch (error) {
    return res.status(503).json({
      error: "Service Unavailable.",
      requestQuery: req.query,
    });
  }
});
