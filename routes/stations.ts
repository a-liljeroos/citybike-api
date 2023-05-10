import { Router, Request, Response } from "express";
import { QueryResult } from "pg";
import { Station, Count } from "../Types";
import { pool } from "../options";
const Joi = require("joi");

export const stationRoutes = Router();

// returns all stations => {station[]}
stationRoutes.get("/all", (req: Request, res: Response) => {
  pool.connect((err, client, release) => {
    if (err) {
      console.error("Error connecting to the database: ", err);
      return;
    }
    client.query(
      "SELECT * FROM station",
      (err, results: QueryResult<Station>) => {
        if (err) {
          console.error("Error executing query: ", err);
          return;
        }
        res.status(200).json(results.rows);
        release();
      }
    );
  });
});

// returns station by id: {station_id: 1} => {station}
stationRoutes.post("/", (req: Request, res: Response) => {
  const schema = Joi.object().keys({
    station_id: Joi.number().min(1).required(),
  });
  if (schema.validate(req.body).error) {
    res.status(422).json({ error: "not a valid station id" });
    return;
  } else {
    pool.connect((err, client, release) => {
      if (err) {
        console.error("Error connecting to the database: ", err);
        return;
      }

      client.query(
        `SELECT * FROM station WHERE station_id = $1;`,
        [req.body.station_id],
        (err, results: QueryResult<Station>) => {
          if (err) {
            res.status(400).json({ "Error executing query: ": err });
            return;
          }

          if (results.rows.length === 0) {
            res.status(400).json({ "Error executing query: ": "No results" });
            return;
          }

          const station = results.rows[0];
          client.query(
            `(SELECT COUNT(*) FROM journey WHERE departure_station_id = $1)
          UNION ALL
          (SELECT COUNT(*) FROM journey WHERE return_station_id = $1)
          `,
            [req.body.station_id],
            (err, results: QueryResult<Count>) => {
              if (err) {
                res.status(400).json({ "Error executing query: ": err });
                return;
              }
              station["station_departures"] = results.rows[0].count;
              station["station_returns"] = results.rows[1].count;
              res.status(200).json(station);
              release();
            }
          );
        }
      );
    });
  }
});
