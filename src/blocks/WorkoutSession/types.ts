export type DraftSet = {
  readonly reps: string;
  readonly weightKg: string;
};

export type DraftExercise = {
  readonly exerciseId: string;
  readonly exerciseName: string;
  readonly sets: DraftSet[];
};

export type ExerciseAction = 'up' | 'down' | 'remove';

export type SetAction = 'add' | 'remove';

export type SetField = keyof DraftSet;
