import express, { type Router } from 'express';

import { authRouter } from './auth/authRoutes.ts';
import { clientsRouter } from './clients/clientsRoutes.ts';
import { exerciseHistoryRouter } from './exerciseHistory/exerciseHistoryRoutes.ts';
import { exercisesRouter } from './exercises/exercisesRoutes.ts';
import { plansRouter } from './plans/plansRoutes.ts';
import { splitTagsRouter } from './splitTags/splitTagsRoutes.ts';
import { trainersAdminRouter } from './trainers/trainersAdminRoutes.ts';
import { activeWorkoutSessionsRouter } from './workoutSessions/activeWorkoutSessionsRoutes.ts';
import { workoutSessionsRouter } from './workoutSessions/workoutSessionsRoutes.ts';

export const apiRouter: Router = express.Router();

apiRouter.use(authRouter);
apiRouter.use('/workout-sessions', activeWorkoutSessionsRouter);
apiRouter.use('/clients/:clientId/workout-sessions', workoutSessionsRouter);
apiRouter.use('/clients/:clientId/plans', plansRouter);
apiRouter.use('/clients/:clientId/exercise-history', exerciseHistoryRouter);
apiRouter.use('/clients/:clientId/split-tags', splitTagsRouter);
apiRouter.use('/clients', clientsRouter);
apiRouter.use('/exercises', exercisesRouter);
apiRouter.use('/admin/trainers', trainersAdminRouter);
