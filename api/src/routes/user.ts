import { routeLogger } from "../../logger";
import { Router, Request, Response } from "express";
import { userRepository } from "../data-source";
import { generateToken, blacklistToken, verifyToken } from "../jsonwebtoken";
const bcrypt = require("bcrypt");
const saltRounds = 10;
import app from "..";
const Joi = require("joi");

export const userRoutes = Router();

const userSchema = {
  username: Joi.string().min(5).max(32).required(),
  password: Joi.string().min(8).max(60).required(),
  repeatPassword: Joi.string().min(8).max(60).required(),
  email: Joi.string().email().min(0).max(255),
};

userRoutes.post("/create", async (req: Request, res: Response) => {
  const requestId = app.locals.requestId;
  const startTime = app.locals.startTime;
  try {
    //
    const schema = Joi.object().keys({
      username: userSchema.username,
      password: userSchema.password,
      repeatPassword: userSchema.repeatPassword,
      email: userSchema.email,
    });

    if (schema.validate(req.body).error) {
      res.status(400).json({
        error: "Not a valid request.",
        message: "The request body does not match the expected schema.",
        correctExample: {
          username: "username",
          password: "password",
          repeatPassword: "password",
          email: "email@example.com",
        },
      });
      return routeLogger.response400(requestId, startTime, req, {
        error: schema.validate(req.body).error.stack,
      });
    }

    if (req.body.password !== req.body.repeatPassword) {
      res.status(400).json({
        error: "Not a valid request.",
        message: "The request body does not match the expected schema.",
        correctExample: {
          username: "username",
          password: "password",
          repeatPassword: "password",
          email: "",
        },
      });
      return routeLogger.response400(requestId, startTime, req, {
        error: "Passwords do not match.",
      });
    }

    const user = await userRepository.findOne({
      where: { username: req.body.username },
    });

    if (user) {
      res.status(409).json({
        error: "Conflict.",
        message: "Cannot create user with that username.",
      });
      return routeLogger.response409(requestId, startTime, req, {
        error: "Username already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const newUser = await userRepository.create({
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email,
    });

    await userRepository.save(newUser);

    let newUserWithId = await userRepository.findOne({
      where: { username: req.body.username },
    });

    delete newUserWithId.password;

    res.status(201).json({
      user: newUserWithId,
    });

    return routeLogger.response201(requestId, startTime, req, {
      newUser: {
        newUserWithId,
      },
    });
    //
  } catch (error) {
    res.status(503).json({
      error: "Service Unavailable.",
    });

    return routeLogger.response503(requestId, startTime, req, {
      error: error.stack,
    });
  }
});

userRoutes.post("/login", async (req: Request, res: Response) => {
  const requestId = app.locals.requestId;
  const startTime = app.locals.startTime;

  try {
    //
    const schema = Joi.object().keys({
      username: userSchema.username,
      password: userSchema.password,
    });

    if (schema.validate(req.body).error) {
      res.status(400).json({
        error: "Not a valid request.",
        message: "The request body does not match the expected schema.",
        correctExample: { username: "username", password: "password" },
      });

      return routeLogger.response400(requestId, startTime, req, {
        error: schema.validate(req.body).error.stack,
      });
    }

    const user = await userRepository.findOne({
      where: { username: req.body.username },
    });

    if (!user) {
      res.status(401).json({
        error: "Unauthorized.",
        message: "Username or password is incorrect.",
      });
      return routeLogger.response401(requestId, startTime, req);
    }

    const passwordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (passwordMatch) {
      const token = generateToken({ id: user.user_id });
      res
        .status(200)
        .setHeader("Authorization", `Bearer ${token}`)
        .json({
          t: token,
          user: {
            id: user.user_id,
            username: user.username,
            email: user.email,
          },
        });
      return routeLogger.response200(requestId, startTime);
    }

    res.status(401).json({
      error: "Unauthorized.",
      message: "Username or password is incorrect.",
    });

    return routeLogger.response401(requestId, startTime, req);
    //
  } catch (error) {
    //
    res.status(503).json({
      error: "Service Unavailable.",
    });
    return routeLogger.response503(requestId, startTime, req, {
      error: error.stack,
    });
  }
});

userRoutes.post("/logout", async (req: Request, res: Response) => {
  const requestId = app.locals.requestId;
  const startTime = app.locals.startTime;

  const token = req.headers["x-access-token"] as string;

  if (token === undefined || token === null) {
    res.status(400).json({ error: "Bad Request" });
    return routeLogger.response400(requestId, startTime, req);
  }

  try {
    //
    verifyToken(token);
    //
  } catch (error) {
    res.status(401).json({ error: "Unauthorized." });
    return routeLogger.response401(requestId, startTime, req, {
      error: error,
    });
  }

  try {
    //
    blacklistToken(token);

    res.status(200).json({
      message: "Logged out.",
    });
    return routeLogger.response200(requestId, startTime);
    //
  } catch (error) {
    //
    res.status(503).json({
      error: "Service Unavailable.",
    });
    return routeLogger.response503(requestId, startTime, req, {
      error: error.stack,
    });
  }
});
