import express, { type Request, type Router } from 'express';

import { requireAuth } from '../middleware/requireAuth.ts';
import { getExerciseHistory } from './exerciseHistoryService.ts';

import '../auth/authContext.ts';

export const exerciseHistoryRouter: Router = express.Router({ mergeParams: true });

exerciseHistoryRouter.use(requireAuth);

function readId(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readParams(req: Request): { readonly clientId?: string; readonly exerciseId?: string } {
  return req.params;
}

exerciseHistoryRouter.get('/:exerciseId', async (req, res) => {
  const { clientId: clientIdParam, exerciseId: exerciseIdParam } = readParams(req);
  const clientId = readId(clientIdParam);
  const exerciseId = readId(exerciseIdParam);
  if (clientId === undefined || exerciseId === undefined) {
    res.status(400).json({ error: 'Некорректный id' });
    return;
  }

  const result = await getExerciseHistory(req.auth!, clientId, exerciseId);
  if (result === undefined) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  res.json(result);
});
