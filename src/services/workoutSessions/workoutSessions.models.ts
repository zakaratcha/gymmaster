export type WorkoutSessionStatus = 'in_progress' | 'completed';

export type WorkoutSessionSet = {
  readonly reps: number;
  readonly weightKg: number;
};

export type WorkoutSessionExercise = {
  readonly exerciseId: string;
  readonly exerciseName: string;
  readonly sets: readonly WorkoutSessionSet[];
};

export type WorkoutSession = {
  readonly id: string;
  readonly clientId: string;
  readonly plannedWorkoutId?: string;
  readonly splitTag: string;
  readonly status: WorkoutSessionStatus;
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly exercises: readonly WorkoutSessionExercise[];
};

export type WorkoutSessionExerciseInput = {
  readonly exerciseId: string;
  readonly sets: readonly WorkoutSessionSet[];
};

export type CreateWorkoutSessionRequest = {
  readonly plannedWorkoutId: string;
};

export type UpdateWorkoutSessionRequest = {
  readonly exercises: readonly WorkoutSessionExerciseInput[];
};

export type WorkoutSessionResponse = {
  readonly workoutSession: WorkoutSession;
};

export type WorkoutSessionActiveResponse = {
  readonly workoutSession: WorkoutSession | null;
};

export type WorkoutSessionLatestCompletedResponse = {
  readonly workoutSession: WorkoutSession | null;
};
