import { DataSource } from "typeorm";
import { Station, Journey } from "./entities/index";
require("dotenv").config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: process.env.DATABASE_PASS,
  database: "citybike",
  synchronize: false,
  logging: false,
  entities: [Station, Journey],
  migrations: [],
  subscribers: [],
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((error) => {
    console.error("Error during Data Source initialization:", error);
  });

export const stationRepository = AppDataSource.getRepository(Station);
export const journeyRepository = AppDataSource.getRepository(Journey);
