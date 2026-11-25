export type PreviousWorkoutComparisonRow = {
  readonly exerciseId: string;
  readonly exerciseName: string;
  readonly previousText: string;
  readonly currentText: string;
  readonly previousVolumeKg: number;
  readonly currentVolumeKg: number;
};

export type PreviousWorkoutComparison = {
  readonly rows: readonly PreviousWorkoutComparisonRow[];
  readonly previousVolumeKg: number;
  readonly currentVolumeKg: number;
};
