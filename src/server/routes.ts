import express, { type Router } from 'express';

import { authRouter } from './auth/authRoutes.ts';
import { clientsRouter } from './clients/clientsRoutes.ts';
import { exercisesRouter } from './exercises/exercisesRoutes.ts';
import { plansRouter } from './plans/plansRoutes.ts';

export const apiRouter: Router = express.Router();

apiRouter.use(authRouter);
apiRouter.use('/clients/:clientId/plans', plansRouter);
apiRouter.use('/clients', clientsRouter);
apiRouter.use('/exercises', exercisesRouter);
