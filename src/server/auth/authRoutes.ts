import express, { type Router } from "express";
import { getCurrentTrainer, login, logout, readSessionToken } from "./authService.ts";
import { requireAuth } from "../middleware/requireAuth.ts";

export const authRouter: Router = express.Router();

authRouter.post("/login", async (req, res) => {
  const body = req.body as { email?: unknown; password?: unknown };

  if (typeof body.email !== "string" || typeof body.password !== "string") {
    res.status(400).json({ error: "validation_error" });
    return;
  }

  const result = await login(body.email, body.password, res);
  if (!result.ok) {
    const status = result.error === "validation_error" ? 400 : 401;
    res.status(status).json({ error: result.error });
    return;
  }

  res.json({ trainer: result.trainer });
});

authRouter.post("/logout", async (req, res) => {
  await logout(readSessionToken(req.cookies), res);
  res.status(204).end();
});

authRouter.get("/current-user", requireAuth, (req, res) => {
  res.json(getCurrentTrainer(req.auth!));
});
