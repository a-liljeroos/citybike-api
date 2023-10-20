import { Router, Request, Response } from "express";
import { TStation, TStationTrafficData } from "../Types";
import { stationRepository, journeyRepository } from "../data-source";
import { cleanData, sortObjectArray, exampleStation } from "../utilities";

const Joi = require("joi");

export const stationRoutes = Router();

// returns all stations => {station[]}

stationRoutes.get("/all", async (req: Request, res: Response) => {
  try {
    const stations = await stationRepository.find();

    if (!stations) {
      return res.status(404).json({
        error: "Record not found.",
      });
    }

    const sortedArray = sortObjectArray({
      array: stations,
      key: "station_name",
      reverse: false,
    });
    return res.status(200).json(sortedArray);
  } catch (error) {
    return res.status(503).json({ error: "Service Unavailable." });
  }
});

stationRoutes.get("/data", async (req: Request, res: Response) => {
  try {
    const station_id = Number(req.query.trafficInfo);

    const departures = await journeyRepository.count({
      where: { departure_station_id: station_id },
    });
    const returns = await journeyRepository.count({
      where: { return_station_id: station_id },
    });

    if (!departures || !returns) {
      return res.status(404).json({
        error: "Record not found.",
      });
    }

    const stationTrafficData: TStationTrafficData = {
      station_departures: departures,
      station_returns: returns,
    };

    return res.status(200).json(stationTrafficData);
  } catch (error) {
    return res.status(503).json({ error: "Service Unavailable." });
  }
});

// returns station by id: {station_id: 1, trafficInfo} => {station} || {station with trafficInfo}

stationRoutes.post("/", async (req: Request, res: Response) => {
  try {
    const schema = Joi.object().keys({
      station_id: Joi.number().min(1).required(),
    });

    if (schema.validate(req.body).error) {
      return res.status(400).json({
        error: "Not a valid request.",
        message: "The request body does not match the expected schema.",
        requestBody: req.body,
        correctExample: { station_id: 1 },
      });
    }

    const station = await stationRepository.findOne({
      where: { station_id: req.body.station_id },
    });

    if (!station) {
      return res.status(404).json({
        error: "Record not found.",
        requestBody: req.body,
      });
    }

    return res.status(200).json(station);
  } catch (error) {
    return res
      .status(503)
      .json({ error: "Service Unavailable", requestBody: req.body });
  }
});

// edit given station

stationRoutes.put("/edit", async (req: Request, res: Response) => {
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
      return res.status(400).json({
        error: "Not a valid request.",
        message: "The request body does not match the expected schema.",
        requestBody: req.body,
        correctExample: exampleStation,
      });
    }

    const station = await stationRepository.findOne({
      where: { station_id: req.body.station_id },
    });

    if (!station) {
      return res.status(404).json({
        error: "Record not found.",
        requestBody: req.body,
      });
    }

    const newStationData = cleanData(req.body);

    await stationRepository.update(station.station_id, newStationData);

    res.status(201).json({
      message: "Resource updated successfully.",
      updatedResource: newStationData,
    });
  } catch (error) {
    res.status(503).json({
      error: "Service Unavailable.",
      requestBody: req.body,
    });
  }
});
