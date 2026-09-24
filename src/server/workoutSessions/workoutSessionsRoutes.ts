import express, { type Request, type Response, type Router } from 'express';

import { requireAuth } from '../middleware/requireAuth.ts';
import { validateCreateWorkoutSessionInput, validateUpdateWorkoutSessionInput } from './workoutSessionsMapper.ts';
import {
  completeWorkoutSession,
  createWorkoutSession,
  getActiveWorkoutSession,
  getLatestCompletedWorkoutSession,
  getWorkoutSessionById,
  updateWorkoutSession,
  WorkoutSessionAlreadyInProgressError,
  WorkoutSessionCompletedError,
  WorkoutSessionInputError
} from './workoutSessionsService.ts';

import '../auth/authContext.ts';

export const workoutSessionsRouter: Router = express.Router({ mergeParams: true });

workoutSessionsRouter.use(requireAuth);

function readClientId(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readSessionId(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readParams(req: Request): { readonly clientId?: string; readonly sessionId?: string } {
  return req.params;
}

function handleWorkoutSessionError(error: unknown, res: Response): boolean {
  if (error instanceof WorkoutSessionInputError) {
    res.status(400).json({ error: error.message });
    return true;
  }

  if (error instanceof WorkoutSessionAlreadyInProgressError) {
    res.status(409).json({ error: 'workout_session_already_in_progress' });
    return true;
  }

  if (error instanceof WorkoutSessionCompletedError) {
    res.status(409).json({ error: 'workout_session_completed' });
    return true;
  }

  return false;
}

workoutSessionsRouter.post('/', async (req, res) => {
  const { clientId: clientIdParam } = readParams(req);
  const clientId = readClientId(clientIdParam);
  if (clientId === undefined) {
    res.status(400).json({ error: 'Некорректный id клиента' });
    return;
  }

  const validation = validateCreateWorkoutSessionInput(req.body);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }

  try {
    const result = await createWorkoutSession(req.auth!, clientId, validation.value);
    if (result === undefined) {
      res.status(404).json({ error: 'not_found' });
      return;
    }

    res.status(201).json(result);
  } catch (error) {
    if (handleWorkoutSessionError(error, res)) {
      return;
    }

    throw error;
  }
});

workoutSessionsRouter.get('/active', async (req, res) => {
  const { clientId: clientIdParam } = readParams(req);
  const clientId = readClientId(clientIdParam);
  if (clientId === undefined) {
    res.status(400).json({ error: 'Некорректный id клиента' });
    return;
  }

  const result = await getActiveWorkoutSession(req.auth!, clientId);
  if (result === undefined) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  res.json(result);
});

workoutSessionsRouter.get('/latest-completed', async (req, res) => {
  const { clientId: clientIdParam } = readParams(req);
  const clientId = readClientId(clientIdParam);
  if (clientId === undefined) {
    res.status(400).json({ error: 'Некорректный id клиента' });
    return;
  }

  const result = await getLatestCompletedWorkoutSession(req.auth!, clientId);
  if (result === undefined) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  res.json(result);
});

workoutSessionsRouter.get('/:sessionId', async (req, res) => {
  const { clientId: clientIdParam, sessionId: sessionIdParam } = readParams(req);
  const clientId = readClientId(clientIdParam);
  const sessionId = readSessionId(sessionIdParam);
  if (clientId === undefined || sessionId === undefined) {
    res.status(400).json({ error: 'Некорректный id' });
    return;
  }

  const result = await getWorkoutSessionById(req.auth!, clientId, sessionId);
  if (result === undefined) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  res.json(result);
});

workoutSessionsRouter.patch('/:sessionId', async (req, res) => {
  const { clientId: clientIdParam, sessionId: sessionIdParam } = readParams(req);
  const clientId = readClientId(clientIdParam);
  const sessionId = readSessionId(sessionIdParam);
  if (clientId === undefined || sessionId === undefined) {
    res.status(400).json({ error: 'Некорректный id' });
    return;
  }

  const validation = validateUpdateWorkoutSessionInput(req.body);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }

  try {
    const result = await updateWorkoutSession(req.auth!, clientId, sessionId, validation.value);
    if (result === undefined) {
      res.status(404).json({ error: 'not_found' });
      return;
    }

    res.json(result);
  } catch (error) {
    if (handleWorkoutSessionError(error, res)) {
      return;
    }

    throw error;
  }
});

workoutSessionsRouter.post('/:sessionId/complete', async (req, res) => {
  const { clientId: clientIdParam, sessionId: sessionIdParam } = readParams(req);
  const clientId = readClientId(clientIdParam);
  const sessionId = readSessionId(sessionIdParam);
  if (clientId === undefined || sessionId === undefined) {
    res.status(400).json({ error: 'Некорректный id' });
    return;
  }

  try {
    const result = await completeWorkoutSession(req.auth!, clientId, sessionId);
    if (result === undefined) {
      res.status(404).json({ error: 'not_found' });
      return;
    }

    res.json(result);
  } catch (error) {
    if (handleWorkoutSessionError(error, res)) {
      return;
    }

    throw error;
  }
});
