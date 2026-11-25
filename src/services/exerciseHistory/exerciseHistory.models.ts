export type ExerciseHistorySet = {
  readonly reps: number;
  readonly weightKg: number;
};

export type ExerciseHistoryEntry = {
  readonly sessionId: string;
  readonly completedAt: string;
  readonly sets: readonly ExerciseHistorySet[];
};

export type ExerciseHistoryResponse = {
  readonly clientName: string;
  readonly exerciseName: string;
  readonly entries: readonly ExerciseHistoryEntry[];
};
