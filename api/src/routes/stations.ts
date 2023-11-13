import { cleanData, sortObjectArray, exampleStation } from "../utilities";
import { routeLogger } from "../../logger";
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
      return routeLogger.response404(requestId, startTime, req, {
        stations: stations,
      });
    }

    const sortedArray = sortObjectArray({
      array: stations,
      key: "station_name",
      reverse: false,
    });
    res.status(200).json(sortedArray);
    return routeLogger.response200(requestId, startTime);
  } catch (error) {
    res.status(503).json({ error: "Service Unavailable." });
    return routeLogger.response503(requestId, startTime, req, { error: error });
  }
});

stationRoutes.get("/data", async (req: Request, res: Response) => {
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
      return routeLogger.response400(requestId, startTime, req, {
        message: "Query parameter is not valid.",
        error: schema.validate(req.query).error.stack,
      });
    }

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
      return routeLogger.response404(requestId, startTime, req, {
        departures: departures,
        returns: returns,
      });
    }

    const stationTrafficData: TStationTrafficData = {
      station_departures: departures,
      station_returns: returns,
    };
    res.status(200).json(stationTrafficData);
    return routeLogger.response200(requestId, startTime);
  } catch (error) {
    res.status(503).json({ error: "Service Unavailable." });
    return routeLogger.response503(requestId, startTime, req, { error: error });
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
      return routeLogger.response400(
        app.locals.requestId,
        app.locals.startTime,
        req,
        {
          message: "Query parameter is not valid.",
          error: schema.validate(req.query).error.stack,
        }
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
      return routeLogger.response404(
        app.locals.requestId,
        app.locals.startTime,
        req,
        { station: station }
      );
    }

    res.status(200).json(station);
    return routeLogger.response200(app.locals.requestId, app.locals.startTime);
  } catch (error) {
    res
      .status(503)
      .json({ error: "Service Unavailable", requestQuery: req.query });
    return routeLogger.response503(
      app.locals.requestId,
      app.locals.startTime,
      req,
      { error: error }
    );
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
      console.log(schema.validate(req.body).error);
      res.status(400).json({
        error: "Not a valid request.",
        message: "The request body does not match the expected schema.",
        requestBody: req.body,
        correctExample: exampleStation,
      });
      return routeLogger.response400(
        app.locals.requestId,
        app.locals.startTime,
        req,
        { error: schema.validate(req.body).error.stack }
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
      return routeLogger.response404(
        app.locals.requestId,
        app.locals.startTime,
        req,
        { station: station }
      );
    }

    const newStationData = cleanData(req.body);

    await stationRepository.update(station.station_id, newStationData);

    res.status(201).json({
      message: "Resource updated successfully.",
      updatedResource: newStationData,
    });
    return routeLogger.response201(
      app.locals.requestId,
      app.locals.startTime,
      req,
      { updatedResource: newStationData }
    );
  } catch (error) {
    res.status(503).json({
      error: "Service Unavailable.",
      requestBody: req.body,
    });
    return routeLogger.response503(
      app.locals.requestId,
      app.locals.startTime,
      req,
      { error: error }
    );
  }
});
