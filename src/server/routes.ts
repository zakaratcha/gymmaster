import express, { type Router } from 'express';

import { authRouter } from './auth/authRoutes.ts';
import { clientsRouter } from './clients/clientsRoutes.ts';

export const apiRouter: Router = express.Router();

apiRouter.use(authRouter);
apiRouter.use('/clients', clientsRouter);
