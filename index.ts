import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Pool, QueryResult } from "pg";
import { Station, Journey, Count } from "./types";
import { corsOptions } from "./options";
const Joi = require("joi");
const cors = require("cors");

dotenv.config();
const app: Express = express();
app.use(express.json());
app.use(cors(corsOptions));
const port = process.env.PORT;

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: process.env.DATABASE_PASS,
  database: "citybike",
});

// returns all stations => {station[]}
app.get("/stations/all", (req: Request, res: Response) => {
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
app.post("/stations", (req: Request, res: Response) => {
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

// returns journeys by page number
app.get("/journeys", (req: Request, res: Response) => {
  const schema = Joi.object().keys({
    page: Joi.number().min(1).required(),
  });

  if (schema.validate(req.query).error) {
    res.status(422).send(schema.validate(req.query.page).error.details);
    return;
  } else {
    pool.connect((err, client, release) => {
      if (err) {
        console.error("Error connecting to the database: ", err);
        return;
      }
      client.query(
        "SELECT COUNT(*) FROM journey;",
        (err, results: QueryResult<Count>) => {
          if (err) {
            console.error("Error executing query: ", err);
            return;
          }
          const journeyAmount: number = results.rows[0].count;
          const pageSize: number = 30;
          const pageNumber: number = Math.ceil(Number(req.query.page));

          const id1 = pageNumber * pageSize - pageSize;
          const id2 = id1 + pageSize - 1;
          client.query(
            "SELECT * FROM journey WHERE id BETWEEN $1 AND $2",
            [id1, id2],
            (err, results: QueryResult<Journey>) => {
              if (err) {
                console.error("Error executing query: ", err);
                res.status(400).json({ error: "No results" });
                return;
              }

              const journeys = results.rows;

              if (journeys.length === 0) {
                res.status(400).json({ error: "No results" });
              }
              res.status(200).json({
                currentPage: pageNumber,
                totalJourneys: journeyAmount,
                journeys: journeys,
                pageSize: pageSize,
              });
              release();
            }
          );
        }
      );
    });
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export default app;
