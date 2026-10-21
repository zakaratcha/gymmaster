import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { formatVolumeDeltaKg, formatVolumeKg } from '../../../services/util/format/format';
import type { WorkoutComparisonRow as RowModel } from '../../../services/workoutSessions/workoutComparison';
import { WorkoutComparisonLine } from '../Line/WorkoutComparison-Line';
import { WorkoutComparisonStatus } from '../Status/WorkoutComparison-Status';

import './WorkoutComparison-Row.scss';

const cnWorkoutComparisonRow = cn('WorkoutComparison', 'Row');
const cnWorkoutComparisonRowHeader = cn('WorkoutComparison', 'RowHeader');

type WorkoutComparisonRowProps = {
  readonly row: RowModel;
};

export const WorkoutComparisonRow: FC<WorkoutComparisonRowProps> = ({ row }) => {
  return (
    <article className={cnWorkoutComparisonRow()}>
      <header className={cnWorkoutComparisonRowHeader()}>
        <strong>{row.exerciseName}</strong>
        <WorkoutComparisonStatus status={row.status} />
      </header>
      <WorkoutComparisonLine label='план' value={row.planText} />
      <WorkoutComparisonLine label='факт' value={row.factText} />
      <WorkoutComparisonLine
        label='объём'
        value={`${formatVolumeKg(row.planVolumeKg)} → ${formatVolumeKg(row.factVolumeKg)} кг (${formatVolumeDeltaKg(row.factVolumeKg - row.planVolumeKg)})`}
      />
    </article>
  );
};
