import express, { type Router } from 'express';

import type { AuthResult } from '../../services/auth/auth.models.ts';
import { requireAuth } from '../middleware/requireAuth.ts';
import { getCurrentTrainer, login, logout, readSessionToken } from './authService.ts';

import './authContext.ts';

export const authRouter: Router = express.Router();

authRouter.post('/login', async (req, res) => {
  const body = req.body as { email?: unknown; password?: unknown };

  if (typeof body.email !== 'string' || typeof body.password !== 'string') {
    const result: AuthResult = { ok: false, error: 'Проверьте введённые данные' };
    res.json(result);
    return;
  }

  const result = await login(body.email, body.password, res);
  res.json(result);
});

authRouter.post('/logout', async (req, res) => {
  await logout(readSessionToken(req), res);
  res.status(204).end();
});

authRouter.get('/current-user', requireAuth, (req, res) => {
  res.json(getCurrentTrainer(req.auth!));
});
