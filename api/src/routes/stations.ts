import { cleanData, sortObjectArray, exampleStation } from "../utilities";
import { endTime } from "../utilities";
import { logger } from "../../logger";
import { Router, Request, Response } from "express";
import { stationRepository, journeyRepository } from "../data-source";
import { TStationTrafficData } from "../Types";
import app from "..";
const Joi = require("joi");

export const stationRoutes = Router();

// returns all stations => {station[]}

stationRoutes.get("/all", async (req: Request, res: Response) => {
  const requestId = app.locals.requestId;
  const startTime = app.locals.startTime;
  try {
    const stations = await stationRepository.find();

    if (!stations) {
      res.status(404).json({
        error: "Record not found.",
      });
      return logger.warn(
        `${requestId}} 404 Record not found. ${endTime(startTime)} ms,`
      );
    }

    const sortedArray = sortObjectArray({
      array: stations,
      key: "station_name",
      reverse: false,
    });
    res.status(200).json(sortedArray);
    return logger.info(
      `${requestId}, Request 200 OK, ${endTime(startTime)} ms,`
    );
  } catch (error) {
    res.status(503).json({ error: "Service Unavailable." });
    return logger.error(
      `${requestId} ${req.method} ${req.url} 503 Service Unavailable. ${endTime(
        startTime
      )} ms, ${error}`
    );
  }
});

stationRoutes.get("/data", async (req: Request, res: Response) => {
  const requestId = app.locals.requestId;
  const startTime = app.locals.startTime;
  try {
    const station_id = Number(req.query.trafficInfo);

    const departures = await journeyRepository.count({
      where: { departure_station_id: station_id },
    });
    const returns = await journeyRepository.count({
      where: { return_station_id: station_id },
    });

    if (!departures || !returns) {
      res.status(404).json({
        error: "Record not found.",
      });
      return logger.warn(
        `${requestId}} 404 Record not found. ${endTime(
          startTime
        )} ms, departures: ${departures}, returns: ${returns}`
      );
    }

    const stationTrafficData: TStationTrafficData = {
      station_departures: departures,
      station_returns: returns,
    };
    res.status(200).json(stationTrafficData);
    return logger.info(`${requestId} Request 200 OK ${endTime(startTime)} ms,`);
  } catch (error) {
    res.status(503).json({ error: "Service Unavailable." });
    return logger.error(
      `${requestId} ${req.method} ${req.url} 503 Service Unavailable. ${error}`
    );
  }
});

// returns station by id: {station_id: 1} => {station}

stationRoutes.get("/", async (req: Request, res: Response) => {
  const requestId = app.locals.requestId;
  const startTime = app.locals.startTime;
  try {
    const schema = Joi.object().keys({
      station_id: Joi.number().min(1).required(),
    });

    if (schema.validate(req.query).error) {
      res.status(400).json({
        error: "Not a valid request.",
        message: "The query parameter does not match the expected schema.",
        requestQuery: req.query,
        correctExample: { station_id: 1 },
      });
      return logger.warn(
        `${requestId} 400 Not a valid request. ${endTime(startTime)} ms,`
      );
    }

    const station_id = Number(req.query.station_id);

    const station = await stationRepository.findOne({
      where: { station_id: station_id },
    });

    if (!station) {
      res.status(404).json({
        error: "Record not found.",
        requestQuery: req.query,
      });
      return logger.warn(
        `${requestId} ${req.method} ${req.url} 404 Record not found. ${endTime(
          startTime
        )} ms,`
      );
    }

    res.status(200).json(station);
    return logger.info(`${requestId} Request 200 OK, ${endTime(startTime)} ms`);
  } catch (error) {
    res
      .status(503)
      .json({ error: "Service Unavailable", requestQuery: req.query });
    return logger.error(`${requestId} 503 Service Unavailable. ${error}`);
  }
});

// edit given station

stationRoutes.put("/edit", async (req: Request, res: Response) => {
  const requestId = app.locals.requestId;
  const startTime = app.locals.startTime;
  try {
    const schema = Joi.object().keys({
      station_id: Joi.number().min(1).required(),
      station_nimi: Joi.string().min(1).max(50).required(),
      station_namn: Joi.string().min(1).max(50).required(),
      station_name: Joi.string().min(1).max(50).required(),
      station_osoite: Joi.string().min(1).max(50).required(),
      station_adress: Joi.string().min(1).max(50).required(),
      station_kaupunki: Joi.string().min(1).max(30).allow(null),
      station_stad: Joi.string().min(1).max(30).allow(null),
      station_operator: Joi.string().min(1).max(30).allow(null),
      station_capacity: Joi.number().min(1).max(32767).required(),
      station_coord_x: Joi.number().min(1).required(),
      station_coord_y: Joi.number().min(1).required(),
    });

    if (schema.validate(req.body).error) {
      res.status(400).json({
        error: "Not a valid request.",
        message: "The request body does not match the expected schema.",
        requestBody: req.body,
        correctExample: exampleStation,
      });
      return logger.warn(
        `${requestId} 400 Not a valid request. ${endTime(startTime)} ms`
      );
    }

    const station = await stationRepository.findOne({
      where: { station_id: req.body.station_id },
    });

    if (!station) {
      res.status(404).json({
        error: "Record not found.",
        requestBody: req.body,
      });
      return logger.warn(
        `${requestId} 404 Record not found. ${endTime(startTime)} ms,`
      );
    }

    const newStationData = cleanData(req.body);

    await stationRepository.update(station.station_id, newStationData);

    res.status(201).json({
      message: "Resource updated successfully.",
      updatedResource: newStationData,
    });
    return logger.info(
      `${requestId} Request 201 Created, ${endTime(startTime)} ms`
    );
  } catch (error) {
    res.status(503).json({
      error: "Service Unavailable.",
      requestBody: req.body,
    });
    return logger.error(
      `${app.locals.requestId} ${req.method} ${
        req.url
      } 503 Service Unavailable. ${endTime(startTime)} ms,  ${error}`
    );
  }
});
