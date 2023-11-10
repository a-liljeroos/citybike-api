import express, { Express, Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { corsOptions } from "./options";
import { stationRoutes } from "./routes/stations";
import { journeyRoutes } from "./routes/journeys";
import "reflect-metadata";
import { routeLogger } from "../logger";
dotenv.config();

const cors = require("cors");
const app: Express = express();

app.use(express.json());
app.use(cors(corsOptions));

app.use((req: Request, res: Response, next: NextFunction) => {
  app.locals.startTime = new Date().getTime();
  app.locals.requestId = uuidv4();
  routeLogger.start(app.locals.requestId, app.locals.startTime, req);
  next();
});

app.use("/stations", stationRoutes);
app.use("/journeys", journeyRoutes);
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    error: "Not Found.",
  });
  return routeLogger.response404(
    app.locals.requestId,
    app.locals.startTime,
    req
  );
});

export default app;
