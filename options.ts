import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

export const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: process.env.DATABASE_PASS,
  database: "citybike",
});

export const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};
