import express, { type Router } from 'express';

import { requireAuth } from '../middleware/requireAuth.ts';
import { requirePlatformAdmin } from '../middleware/requirePlatformAdmin.ts';
import {
  validateCreateTrainerInput,
  validateResetTrainerPasswordInput,
  validateUpdateTrainerStatusInput
} from './trainerMapper.ts';
import {
  createTrainerAccount,
  listOtherTrainers,
  resetTrainerAccountPassword,
  updateTrainerAccountStatus
} from './trainersAdminService.ts';

import '../auth/authContext.ts';

export const trainersAdminRouter: Router = express.Router();

trainersAdminRouter.use(requireAuth);
trainersAdminRouter.use(requirePlatformAdmin);

function readId(id: string | string[] | undefined): string | undefined {
  if (typeof id !== 'string' || id.length === 0) {
    return undefined;
  }

  return id;
}

trainersAdminRouter.get('/', async (req, res) => {
  const result = await listOtherTrainers(req.auth!);
  res.json(result);
});

trainersAdminRouter.post('/', async (req, res) => {
  const validation = validateCreateTrainerInput(req.body);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const result = await createTrainerAccount(validation.value);
  if (!result.ok) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  res.status(201).json({ trainer: result.trainer });
});

trainersAdminRouter.patch('/:id/status', async (req, res) => {
  const id = readId(req.params.id);
  if (id === undefined) {
    res.status(400).json({ error: 'Некорректный id' });
    return;
  }

  const validation = validateUpdateTrainerStatusInput(req.body);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const result = await updateTrainerAccountStatus(req.auth!, id, validation.value);
  if (!result.ok) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  res.json({ trainer: result.trainer });
});

trainersAdminRouter.put('/:id/password', async (req, res) => {
  const id = readId(req.params.id);
  if (id === undefined) {
    res.status(400).json({ error: 'Некорректный id' });
    return;
  }

  const validation = validateResetTrainerPasswordInput(req.body);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const result = await resetTrainerAccountPassword(req.auth!, id, validation.value);
  if (!result.ok) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  res.status(204).end();
});
