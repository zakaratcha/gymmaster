import express, { type Router } from 'express';

import { requireAuth } from '../middleware/requireAuth.ts';
import { validateCreateClientInput, validateUpdateClientInput } from './clientMapper.ts';
import { createClient, deleteClient, getClientById, listClients, updateClient } from './clientsService.ts';

import '../auth/authContext.ts';

export const clientsRouter: Router = express.Router();

clientsRouter.use(requireAuth);

clientsRouter.get('/', async (req, res) => {
  const result = await listClients(req.auth!);
  res.json(result);
});

clientsRouter.post('/', async (req, res) => {
  const validation = validateCreateClientInput(req.body);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const result = await createClient(req.auth!, validation.value);
  res.status(201).json(result);
});

clientsRouter.get('/:id', async (req, res) => {
  const id = req.params.id;
  if (typeof id !== 'string' || id.length === 0) {
    res.status(400).json({ error: 'Некорректный id' });
    return;
  }

  const result = await getClientById(req.auth!, id);
  if (result === undefined) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  res.json(result);
});

clientsRouter.patch('/:id', async (req, res) => {
  const id = req.params.id;
  if (typeof id !== 'string' || id.length === 0) {
    res.status(400).json({ error: 'Некорректный id' });
    return;
  }

  const validation = validateUpdateClientInput(req.body);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const result = await updateClient(req.auth!, id, validation.value);
  if (result === undefined) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  res.json(result);
});

clientsRouter.delete('/:id', async (req, res) => {
  const id = req.params.id;
  if (typeof id !== 'string' || id.length === 0) {
    res.status(400).json({ error: 'Некорректный id' });
    return;
  }

  const deleted = await deleteClient(req.auth!, id);
  if (!deleted) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  res.status(204).end();
});
