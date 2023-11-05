import express, { Express } from "express";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { corsOptions } from "./options";
import { stationRoutes } from "./routes/stations";
import { journeyRoutes } from "./routes/journeys";
import "reflect-metadata";
import { logger } from "../logger";
dotenv.config();

const cors = require("cors");
const app: Express = express();

app.use(express.json());
app.use(cors(corsOptions));

app.use((req, res, next) => {
  app.locals.startTime = new Date().getTime();
  app.locals.requestId = uuidv4();
  const entryLog = `${app.locals.requestId}, ${new Date().toLocaleString()}, ${
    req.method
  } ${req.url}, ${JSON.stringify(req.headers["sec-ch-ua"])},${JSON.stringify(
    req.headers["sec-ch-ua-platform"]
  )}, ${JSON.stringify(req.body)}, ${JSON.stringify(req.query)}`;
  logger.info(entryLog);
  next();
});

app.use("/stations", stationRoutes);
app.use("/journeys", journeyRoutes);

export default app;
