import "reflect-metadata";
import { corsOptions } from "./options";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import express, { Express, Request, Response, NextFunction } from "express";
dotenv.config();

// routes
import { journeyRoutes } from "./routes/journeys";
import { routeLogger } from "../logger";
import { stationRoutes } from "./routes/stations";
import { userRoutes } from "./routes/user";

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

app.use("/journeys", journeyRoutes);
app.use("/stations", stationRoutes);
app.use("/user", userRoutes);

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
