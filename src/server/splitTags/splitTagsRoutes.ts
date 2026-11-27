import express, { type Request, type Router } from 'express';

import { requireAuth } from '../middleware/requireAuth.ts';
import { validateAddSplitTagInput } from './splitTagsMapper.ts';
import { addSplitTag, listSplitTags } from './splitTagsService.ts';

import '../auth/authContext.ts';

export const splitTagsRouter: Router = express.Router({ mergeParams: true });

splitTagsRouter.use(requireAuth);

function readClientId(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readParams(req: Request): { readonly clientId?: string } {
  return req.params;
}

splitTagsRouter.get('/', async (req, res) => {
  const clientId = readClientId(readParams(req).clientId);
  if (clientId === undefined) {
    res.status(400).json({ error: 'Некорректный id клиента' });
    return;
  }

  const result = await listSplitTags(req.auth!, clientId);
  if (result === undefined) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  res.json(result);
});

splitTagsRouter.post('/', async (req, res) => {
  const clientId = readClientId(readParams(req).clientId);
  if (clientId === undefined) {
    res.status(400).json({ error: 'Некорректный id клиента' });
    return;
  }

  const validation = validateAddSplitTagInput(req.body);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const result = await addSplitTag(req.auth!, clientId, validation.value);
  if (result === undefined) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  res.json(result);
});
