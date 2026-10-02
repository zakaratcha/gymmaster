import express, { type Router } from 'express';

import { requireAuth } from '../middleware/requireAuth.ts';
import { listActiveWorkoutSessions } from './workoutSessionsService.ts';

import '../auth/authContext.ts';

export const activeWorkoutSessionsRouter: Router = express.Router();

activeWorkoutSessionsRouter.use(requireAuth);

activeWorkoutSessionsRouter.get('/active', async (req, res) => {
  const result = await listActiveWorkoutSessions(req.auth!);
  res.json(result);
});
