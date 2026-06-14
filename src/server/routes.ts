import express, { type Router } from 'express';

import { authRouter } from './auth/authRoutes.ts';

export const apiRouter: Router = express.Router();

apiRouter.use(authRouter);
