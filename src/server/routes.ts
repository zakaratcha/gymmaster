import express, { type Router } from 'express';

import { authRouter } from './auth/authRoutes.ts';

export const apiRouter: Router = express.Router();

apiRouter.get('/hello', (_req, res) => {
  res.json({ message: 'Hello world from api!' });
});

apiRouter.use(authRouter);
