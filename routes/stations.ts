import { Router, Request, Response } from "express";
import { QueryResult } from "pg";
import { Station } from "../Types";
import { pool } from "../options";

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
