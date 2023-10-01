import { Router, Request, Response } from "express";
import { TStation } from "../Types";
import { stationRepository, journeyRepository } from "../data-source";
import { cleanData, sortObjectArray } from "../utilities";
const Joi = require("joi");

export const stationRoutes = Router();

// returns all stations => {station[]}

stationRoutes.get("/all", async (req: Request, res: Response) => {
  try {
    const stations = await stationRepository.find();
    const sortedArray = sortObjectArray({
      array: stations,
      key: "station_name",
      reverse: false,
    });
    res.status(200).json(sortedArray);
  } catch (error) {
    res.status(400).json({ error: "No results" });
  }
});

// returns station by id: {station_id: 1} => {station}

stationRoutes.post("/", async (req: Request, res: Response) => {
  const schema = Joi.object().keys({
    station_id: Joi.number().min(1).required(),
    trafficInfo: Joi.boolean().required(),
  });

  if (schema.validate(req.body).error) {
    // WRONG PARAMETERS RESPONSE 422
    res.status(422).json({
      error: "not a valid request",
      correctExample: { station_id: 1, trafficInfo: true },
    });
    return;
  }

  try {
    // FIND THE STATION BY STATION_ID
    const station = await stationRepository.findOne({
      where: { station_id: req.body.station_id },
    });

    if (!station) {
      return res.status(400).json({ "Error executing query: ": "No results" });
    }

    // IF TRAFFICINFO IS FALSE, RETURN ONLY STATION DATA
    if (req.body.trafficInfo === false) {
      res.status(200).json(station);
      return;
    }

    const departures = await journeyRepository.count({
      where: { departure_station_id: req.body.station_id },
    });
    const returns = await journeyRepository.count({
      where: { return_station_id: req.body.station_id },
    });

    // ADD DEPARTURES AND RETURNS TO STATION
    const stationWithDeparturesAndReturns: TStation = {
      ...station,
      station_departures: departures,
      station_returns: returns,
    };

    // STATION DATA RESPONSE 200
    res.status(200).json(stationWithDeparturesAndReturns);
  } catch (error) {
    console.error("Error executing query: ", error);
    res.status(400).json({ "Error executing query: ": error });
  }
});

stationRoutes.put("/edit", async (req: Request, res: Response) => {
  try {
    const schema = Joi.object().keys({
      station_id: Joi.number().min(1).required(),
      station_nimi: Joi.string().min(1).max(50).required(),
      station_namn: Joi.string().min(1).max(50).required(),
      station_name: Joi.string().min(1).max(50).required(),
      station_osoite: Joi.string().min(1).max(50).required(),
      station_adress: Joi.string().min(1).max(50).required(),
      station_kaupunki: Joi.string().min(1).max(30),
      station_stad: Joi.string().min(1).max(30),
      station_operator: Joi.string().min(1).max(30),
      station_capacity: Joi.number().min(1).max(32767).required(),
      station_coord_x: Joi.number().min(1).required(),
      station_coord_y: Joi.number().min(1).required(),
    });

    if (schema.validate(req.body).error) {
      return res.status(422).json({ error: "Not valid station data" });
    }

    const station = await stationRepository.findOne({
      where: { station_id: req.body.station_id },
    });

    if (!station) {
      return res.status(422).json({ "error:": "The id does not exist" });
    }

    const newStationData = cleanData(req.body);

    await stationRepository.update(station.station_id, newStationData);

    res.status(200).json({
      message: "Resource updated successfully",
      updatedResource: newStationData,
    });
  } catch (error) {
    res.status(422).json({
      error: "Failed to update",
      data: req.body,
    });
  }
});
