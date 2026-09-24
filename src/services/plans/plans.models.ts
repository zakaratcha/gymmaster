export type PlannedSet = {
  readonly reps: number;
  readonly weightKg: number;
};

export type PlannedExercise = {
  readonly exerciseId: string;
  readonly exerciseName: string;
  readonly sets: readonly PlannedSet[];
};

export type PlannedWorkout = {
  readonly id: string;
  readonly clientId: string;
  readonly plannedDate: string;
  readonly splitTag: string;
  readonly exercises: readonly PlannedExercise[];
};

export type PlannedSetInput = {
  readonly reps: number;
  readonly weightKg: number;
};

export type PlannedExerciseInput = {
  readonly exerciseId: string;
  readonly sets: readonly PlannedSetInput[];
};

export type CreatePlannedWorkoutRequest = {
  readonly plannedDate: string;
  readonly splitTag: string;
  readonly exercises: readonly PlannedExerciseInput[];
};

export type UpdatePlannedWorkoutRequest = {
  readonly plannedDate?: string;
  readonly splitTag?: string;
  readonly exercises?: readonly PlannedExerciseInput[];
};

export type PlansListResponse = {
  readonly plans: readonly PlannedWorkout[];
};

export type PlanResponse = {
  readonly plan: PlannedWorkout;
};
