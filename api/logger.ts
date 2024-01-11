const { createLogger, format, transports } = require("winston");
const { combine, splat, json, simple, errors, timestamp } = format;
import { Request } from "express";

class RouteLogger {
  private logger;

  constructor() {
    this.logger = createLogger({
      defaultMeta: { service: "api" },
      format: combine(json(), splat(), errors(), timestamp()),
      transports: [
        new transports.File({
          level: "info",
          dirname: "logs",
          filename: `info.log`,
          maxsize: 5242880,
          maxFiles: 5,
        }),
        new transports.File({
          level: "warn",
          dirname: "logs",
          filename: "warn.log",
        }),
        new transports.File({
          level: "error",
          dirname: "logs",
          filename: "error.log",
        }),
      ],
    });

    if (process.env.NODE_ENV !== "production") {
      this.logger.add(
        new transports.Console({
          format: combine(json(), simple(), errors(), timestamp()),
        })
      );
    }
  }

  private redactPassword(body: Record<string, any>): Record<string, any> {
    const redactedBody = { ...body };
    if (redactedBody.password) {
      redactedBody.password = "********";
    }
    return redactedBody;
  }

  private startTime: number = new Date().getTime();

  private endTime(startTime: number): number {
    return new Date().getTime() - startTime;
  }

  public info(message: Object) {
    this.logger.info(message);
  }

  public warn(message: Object) {
    this.logger.warn(message);
  }

  public error(message: Object) {
    this.logger.error(message);
  }

  public start(requestId: string, startTime: number, req: Request) {
    const requestBody = this.redactPassword(req.body);
    this.logger.info({
      requestId: requestId,
      startTime: new Date().toLocaleString(),
      method: `${req.method}`,
      httpVersion: req.httpVersion,
      userAgent: req.headers["user-agent"],
      url: req.url,
      query: req.query,
      body: requestBody,
      xAccessToken: req.headers["x-access-token"],
    });
  }

  public response200(requestId: string, startTime: number) {
    this.logger.info({
      requestId: requestId,
      responseCode: 200,
      duration: this.endTime(startTime),
    });
  }

  public response201(
    requestId: string,
    startTime: number,
    req: Request,
    message?: {}
  ) {
    this.logger.info({
      requestId: requestId,
      responseCode: 201,
      url: req.url,
      duration: this.endTime(startTime),
      message: message ? message : null,
    });
  }

  public response400(
    requestId: string,
    startTime: number,
    req: Request,
    message?: {}
  ) {
    const requestBody = this.redactPassword(req.body);
    this.logger.warn({
      requestId: requestId,
      responseCode: 400,
      query: req.query,
      body: requestBody,
      url: req.url,
      duration: this.endTime(startTime),
      message: message ? message : null,
    });
  }

  public response401(
    requestId: string,
    startTime: number,
    req: Request,
    message?: {}
  ) {
    this.logger.warn({
      requestId: requestId,
      time: new Date().toLocaleString(),
      responseCode: 401,
      url: req.url,
      duration: this.endTime(startTime),
      message: message ? message : null,
    });
  }

  public response404(
    requestId: string,
    startTime: number,
    req: Request,
    message?: {}
  ) {
    this.logger.warn({
      requestId: requestId,
      time: new Date().toLocaleString(),
      responseCode: 404,
      url: req.url,
      duration: this.endTime(startTime),
      message: message ? message : null,
    });
  }

  public response409(
    requestId: string,
    startTime: number,
    req: Request,
    message?: {}
  ) {
    this.logger.warn({
      requestId: requestId,
      time: new Date().toLocaleString(),
      responseCode: 409,
      url: req.url,
      duration: this.endTime(startTime),
      message: message ? message : null,
    });
  }

  public response503(
    requestId: string,
    startTime: number,
    req: Request,
    message?: {}
  ) {
    this.logger.error({
      requestId: requestId,
      time: new Date().toLocaleString(),
      responseCode: 503,
      url: req.url,
      duration: this.endTime(startTime),
      message: message ? message : null,
    });
  }
}

export const routeLogger = new RouteLogger();
