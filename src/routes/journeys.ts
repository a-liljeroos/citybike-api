import { Router, Request, Response } from "express";
import { QueryResult } from "pg";
import { TJourney, Count } from "../Types";
import { pool } from "../options";
const Joi = require("joi");

export const journeyRoutes = Router();

// returns journeys by page number
journeyRoutes.get("/pages", (req: Request, res: Response) => {
  const schema = Joi.object().keys({
    page: Joi.number().min(1).required(),
  });

  if (schema.validate(req.query).error) {
    //
    // WRONG PARAMETERS RESPONSE
    res.status(422).send(schema.validate(req.query.page).error.details);
    return;
  } else {
    pool.connect((err, client, release) => {
      if (err) {
        console.error("Error connecting to the database: ", err);
        return;
      }
      //
      // HOW MANY JOURENYS IN THE DATABASE
      //
      client.query(
        "SELECT COUNT(*) FROM journey;",
        (err, results: QueryResult<Count>) => {
          if (err) {
            console.error("Error executing query: ", err);
            return;
          }
          const totalJourneys: number = results.rows[0].count;
          const pageSize: number = 30;
          const pageNumber: number = Math.ceil(Number(req.query.page));

          const id1 = pageNumber * pageSize - pageSize;
          const id2 = id1 + pageSize - 1;
          //
          // SELECT A RANGE OF JOURNEYS FOR THE PAGE
          //
          client.query(
            "SELECT * FROM journey WHERE id BETWEEN $1 AND $2",
            [id1, id2],
            (err, results: QueryResult<TJourney>) => {
              if (err) {
                console.error("Error executing query: ", err);
                res.status(400).json({ error: "No results" });
                return;
              }

              const journeys = results.rows;
              //
              // NO RESULTS RESPONSE
              if (journeys.length === 0) {
                res.status(400).json({ error: "No results" });
              }
              //
              // PAGE RESPONSE
              res.status(200).json({
                journeys: journeys,
                pagination: {
                  currentPage: pageNumber,
                  pageSize: pageSize,
                  totalJourneys: totalJourneys,
                  totalPages: Math.ceil(totalJourneys / 30),
                },
              });
              release();
            }
          );
        }
      );
    });
  }
});
