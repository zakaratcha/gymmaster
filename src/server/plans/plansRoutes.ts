import express, { type Request, type Router } from 'express';

import { requireAuth } from '../middleware/requireAuth.ts';
import { validateCreatePlanInput, validateUpdatePlanInput } from './plansMapper.ts';
import { createPlan, deletePlan, getPlanById, listPlans, PlanInputError, updatePlan } from './plansService.ts';

import '../auth/authContext.ts';

export const plansRouter: Router = express.Router({ mergeParams: true });

plansRouter.use(requireAuth);

function readClientId(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readPlanId(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readParams(req: Request): { readonly clientId?: string; readonly planId?: string } {
  return req.params;
}

plansRouter.get('/', async (req, res) => {
  const { clientId: clientIdParam } = readParams(req);
  const clientId = readClientId(clientIdParam);
  if (clientId === undefined) {
    res.status(400).json({ error: 'Некорректный id клиента' });
    return;
  }

  const result = await listPlans(req.auth!, clientId);
  if (result === undefined) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  res.json(result);
});

plansRouter.post('/', async (req, res) => {
  const { clientId: clientIdParam } = readParams(req);
  const clientId = readClientId(clientIdParam);
  if (clientId === undefined) {
    res.status(400).json({ error: 'Некорректный id клиента' });
    return;
  }

  const validation = validateCreatePlanInput(req.body);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }

  try {
    const result = await createPlan(req.auth!, clientId, validation.value);
    if (result === undefined) {
      res.status(404).json({ error: 'not_found' });
      return;
    }

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof PlanInputError) {
      res.status(400).json({ error: error.message });
      return;
    }

    throw error;
  }
});

plansRouter.get('/:planId', async (req, res) => {
  const { clientId: clientIdParam, planId: planIdParam } = readParams(req);
  const clientId = readClientId(clientIdParam);
  const planId = readPlanId(planIdParam);
  if (clientId === undefined || planId === undefined) {
    res.status(400).json({ error: 'Некорректный id' });
    return;
  }

  const result = await getPlanById(req.auth!, clientId, planId);
  if (result === undefined) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  res.json(result);
});

plansRouter.patch('/:planId', async (req, res) => {
  const { clientId: clientIdParam, planId: planIdParam } = readParams(req);
  const clientId = readClientId(clientIdParam);
  const planId = readPlanId(planIdParam);
  if (clientId === undefined || planId === undefined) {
    res.status(400).json({ error: 'Некорректный id' });
    return;
  }

  const validation = validateUpdatePlanInput(req.body);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }

  try {
    const result = await updatePlan(req.auth!, clientId, planId, validation.value);
    if (result === undefined) {
      res.status(404).json({ error: 'not_found' });
      return;
    }

    res.json(result);
  } catch (error) {
    if (error instanceof PlanInputError) {
      res.status(400).json({ error: error.message });
      return;
    }

    throw error;
  }
});

plansRouter.delete('/:planId', (req, res) => {
  const { clientId: clientIdParam, planId: planIdParam } = readParams(req);
  const clientId = readClientId(clientIdParam);
  const planId = readPlanId(planIdParam);
  if (clientId === undefined || planId === undefined) {
    res.status(400).json({ error: 'Некорректный id' });
    return;
  }

  const deleted = deletePlan(req.auth!, clientId, planId);
  if (!deleted) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  res.status(204).end();
});
