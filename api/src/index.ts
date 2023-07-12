import express, { Express } from "express";
import dotenv from "dotenv";
import { corsOptions } from "./options";
import { stationRoutes } from "./routes/stations";
import { journeyRoutes } from "./routes/journeys";
import "reflect-metadata";

dotenv.config();

const cors = require("cors");
const app: Express = express();

app.use(express.json());
app.use(cors(corsOptions));
app.use("/stations", stationRoutes);
app.use("/journeys", journeyRoutes);

export default app;
