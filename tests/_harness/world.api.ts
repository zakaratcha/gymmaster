import { type IWorldOptions, World } from '@cucumber/cucumber';

import type { ApiError } from '../../src/services/api/api.models';
import type { AuthResult } from '../../src/services/auth/auth.models';
import type { Client } from '../../src/services/clients/clients.models';
import type { ExerciseHistoryResponse } from '../../src/services/exerciseHistory/exerciseHistory.models';
import type { Exercise } from '../../src/services/exercises/exercises.models';
import type { PlannedWorkout } from '../../src/services/plans/plans.models';
import type { AdminTrainer, Trainer } from '../../src/services/trainers/trainers.models';
import type { ActiveWorkoutSession, WorkoutSession } from '../../src/services/workoutSessions/workoutSessions.models';

export class ApiWorld extends World {
  adminTrainer?: AdminTrainer;
  adminTrainers?: readonly AdminTrainer[];
  authResult?: AuthResult;
  lastError?: ApiError;
  passwordChangeError?: ApiError;
  activeWorkoutSessions?: readonly ActiveWorkoutSession[];
  activeWorkoutSession?: WorkoutSession | null;
  archivedExercise?: Exercise;
  client?: Client;
  clients?: readonly Client[];
  exercise?: Exercise;
  exerciseHistory?: ExerciseHistoryResponse;
  historyFixtures?: readonly {
    readonly sessionId: string;
    readonly exerciseName: string;
    readonly sets: readonly { readonly reps: number; readonly weightKg: number }[];
  }[];
  exercises?: readonly Exercise[];
  firstCompletedAt?: string;
  foreignExercise?: Exercise;
  latestCompletedSession?: WorkoutSession | null;
  plan?: PlannedWorkout;
  plans?: readonly PlannedWorkout[];
  previousWorkoutSession?: WorkoutSession | null;
  secondaryClient?: Client;
  secondaryPlan?: PlannedWorkout;
  splitTags?: readonly string[];
  trainer?: Trainer;
  trainerClient?: Client;
  trainerWorkoutSession?: WorkoutSession;
  workoutSession?: WorkoutSession;
  workoutSessions?: readonly WorkoutSession[];

  constructor(options: IWorldOptions) {
    super(options);
  }
}
