const { createLogger, format, transports } = require("winston");
const { combine, splat, json, colorize, errors } = format;

export const logger = createLogger({
  level: "info",
  defaultMeta: {},
  format: combine(json(), splat(), errors({ stack: true }), colorize()),
  transports: [
    new transports.File({
      dirname: "logs",
      filename: "error.log",
      level: "error",
    }),
    new transports.File({ dirname: "logs", filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new transports.Console({ format: format.simple() }));
}
