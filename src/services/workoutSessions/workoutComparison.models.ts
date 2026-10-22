export type WorkoutComparisonStatus = 'matched' | 'deviated' | 'not_done' | 'extra';

export type WorkoutComparisonRow = {
  readonly exerciseId: string;
  readonly exerciseName: string;
  readonly planText: string;
  readonly factText: string;
  readonly status: WorkoutComparisonStatus;
  readonly planVolumeKg: number;
  readonly factVolumeKg: number;
};

export type WorkoutComparisonTotals = {
  readonly exerciseCount: number;
  readonly setCount: number;
  readonly volumeKg: number;
};

export type WorkoutComparison = {
  readonly rows: readonly WorkoutComparisonRow[];
  readonly planTotals: WorkoutComparisonTotals;
  readonly factTotals: WorkoutComparisonTotals;
};
