import express, { type Router } from 'express';

import type { AuthResult } from '../../services/auth/auth.models.ts';
import { requireAuth } from '../middleware/requireAuth.ts';
import { validateChangeOwnPasswordInput } from '../trainers/trainerMapper.ts';
import { changeOwnPassword, getCurrentTrainer, login, logout, readSessionToken } from './authService.ts';

import './authContext.ts';

export const CHANGE_PASSWORD_PATH = '/current-user/password';

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

authRouter.put(CHANGE_PASSWORD_PATH, requireAuth, async (req, res) => {
  const validation = validateChangeOwnPasswordInput(req.body);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const result = await changeOwnPassword(req.auth!, validation.value, res);
  if (!result.ok) {
    if (result.status === 403) {
      res.status(403).json({ error: 'forbidden' });
      return;
    }

    res.status(400).json({ error: result.error });
    return;
  }

  res.status(204).end();
});
