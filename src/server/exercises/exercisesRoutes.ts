import express, { type Router } from 'express';

import { requireAuth } from '../middleware/requireAuth.ts';
import { validateCreateExerciseInput, validateUpdateExerciseInput } from './exerciseMapper.ts';
import { createExercise, getExerciseById, listExercises, updateExercise } from './exercisesService.ts';

import '../auth/authContext.ts';

export const exercisesRouter: Router = express.Router();

exercisesRouter.use(requireAuth);

function parseIncludeArchived(value: unknown): boolean {
  return value === 'true';
}

exercisesRouter.get('/', async (req, res) => {
  const result = await listExercises(req.auth!, parseIncludeArchived(req.query.includeArchived));
  res.json(result);
});

exercisesRouter.post('/', async (req, res) => {
  const validation = validateCreateExerciseInput(req.body);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const result = await createExercise(req.auth!, validation.value);
  res.status(201).json(result);
});

exercisesRouter.get('/:id', async (req, res) => {
  const id = req.params.id;
  if (typeof id !== 'string' || id.length === 0) {
    res.status(400).json({ error: 'Некорректный id' });
    return;
  }

  const result = await getExerciseById(req.auth!, id);
  if (result === undefined) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  res.json(result);
});

exercisesRouter.patch('/:id', async (req, res) => {
  const id = req.params.id;
  if (typeof id !== 'string' || id.length === 0) {
    res.status(400).json({ error: 'Некорректный id' });
    return;
  }

  const validation = validateUpdateExerciseInput(req.body);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const result = await updateExercise(req.auth!, id, validation.value);
  if (result === undefined) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  res.json(result);
});
