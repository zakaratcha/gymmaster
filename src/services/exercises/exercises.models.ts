export type Exercise = {
  readonly id: string;
  readonly name: string;
  readonly notes?: string;
  readonly archivedAt?: string;
};

export type CreateExerciseRequest = {
  readonly name: string;
  readonly notes?: string;
};

export type UpdateExerciseRequest = {
  readonly name?: string;
  readonly notes?: string | null;
  readonly archived?: boolean;
};

export type ExercisesListResponse = {
  readonly exercises: readonly Exercise[];
};

export type ExerciseResponse = {
  readonly exercise: Exercise;
};
