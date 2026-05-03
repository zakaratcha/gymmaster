import express, { type Router } from "express";

export const apiRouter: Router = express.Router();

apiRouter.get("/hello", (_req, res) => {
  res.json({ message: "Hello world!" });
});
