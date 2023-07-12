import { Router, Request, Response } from "express";
import { TStation } from "../Types";
import { stationRepository, journeyRepository } from "../data-source";
const Joi = require("joi");

export const stationRoutes = Router();

// returns all stations => {station[]}

stationRoutes.get("/all", async (req: Request, res: Response) => {
  try {
    const stations = await stationRepository.find();
    res.status(200).json(stations);
  } catch (error) {
    res.status(400).json({ error: "No results" });
  }
});

// returns station by id: {station_id: 1} => {station}

stationRoutes.post("/", async (req: Request, res: Response) => {
  const schema = Joi.object().keys({
    station_id: Joi.number().min(1).required(),
  });

  if (schema.validate(req.body).error) {
    // WRONG PARAMETERS RESPONSE 422
    res.status(422).json({ error: "not a valid station id" });
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
