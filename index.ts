import express, { Express } from "express";
import dotenv from "dotenv";
import { corsOptions } from "./options";
import { stationRoutes } from "./routes/stations";

dotenv.config();
const port = process.env.PORT;

const cors = require("cors");
const app: Express = express();

app.use(express.json());
app.use(cors(corsOptions));
app.use("/stations", stationRoutes);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export default app;
