import type { NextFunction, Request, Response } from 'express';

import { authContextFromTrainerRow, readSessionToken } from '../auth/authService.ts';
import { findTrainerBySessionToken } from '../auth/sessionStore.ts';

import '../auth/authContext.ts';

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = readSessionToken(req);

  if (token === undefined) {
    res.status(403).json({ error: 'forbidden' });
    return;
  }

  const trainer = await findTrainerBySessionToken(token);
  if (trainer === undefined) {
    res.status(403).json({ error: 'forbidden' });
    return;
  }

  req.auth = authContextFromTrainerRow(trainer);
  next();
}
