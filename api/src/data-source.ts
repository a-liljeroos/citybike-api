import { DataSource, Repository } from "typeorm";
import { Station, Journey, Users } from "./entities/index";
require("dotenv").config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "postgres",
  port: 5432,
  username: "postgres",
  password: process.env.DATABASE_PASS,
  database: "citybike",
  synchronize: false,
  logging: false,
  entities: [Station, Journey, Users],
  migrations: [],
  subscribers: [],
});

export const TestDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: process.env.DATABASE_PASS,
  database: "citybiketest",
  synchronize: false,
  logging: false,
  entities: [Station, Journey, Users],
  migrations: [],
  subscribers: [],
});

if (process.env.NODE_ENV !== "test") {
  AppDataSource.initialize()
    .then(() => {
      console.log("Data Source has been initialized!");
    })
    .catch((error) => {
      console.error("Error during Data Source initialization:", error);
    });
}

let stationRepository: Repository<Station>;
let journeyRepository: Repository<Journey>;
let userRepository: Repository<Users>;

if (process.env.NODE_ENV !== "test") {
  stationRepository = AppDataSource.getRepository(Station);
  journeyRepository = AppDataSource.getRepository(Journey);
  userRepository = AppDataSource.getRepository(Users);
} else {
  stationRepository = TestDataSource.getRepository(Station);
  journeyRepository = TestDataSource.getRepository(Journey);
  userRepository = TestDataSource.getRepository(Users);
}

export { stationRepository, journeyRepository, userRepository };
