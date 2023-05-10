import { Router, Request, Response } from "express";
import { Pool, QueryResult } from "pg";
import { Station, Journey, Count } from "../Types";
import dotenv from "dotenv";
dotenv.config();

export const routes = Router();

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: process.env.DATABASE_PASS,
  database: "citybike",
});

// returns all stations => {station[]}
routes.get("/stations/all", (req: Request, res: Response) => {
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
