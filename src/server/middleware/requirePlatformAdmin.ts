import type { NextFunction, Request, Response } from 'express';

import { isPlatformAdmin } from '../../services/trainers/trainers.utils.ts';

import '../auth/authContext.ts';

export function requirePlatformAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!isPlatformAdmin(req.auth?.roles)) {
    res.status(403).json({ error: 'forbidden' });
    return;
  }

  next();
}
