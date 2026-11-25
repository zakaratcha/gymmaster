import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { formatVolumeDeltaKg, formatVolumeKg } from '../../../services/util/format.utils';
import type { WorkoutComparisonRow as RowModel } from '../../../services/workoutSessions/workoutComparison.models';
import { WorkoutComparisonLine } from '../Line/WorkoutComparison-Line';
import { WorkoutComparisonRowHeader } from '../RowHeader/WorkoutComparison-RowHeader';

import './WorkoutComparison-Row.scss';

const cnWorkoutComparisonRow = cn('WorkoutComparison', 'Row');

type WorkoutComparisonRowProps = {
  readonly clientId?: string;
  readonly row: RowModel;
};

export const WorkoutComparisonRow: FC<WorkoutComparisonRowProps> = ({ clientId, row }) => {
  return (
    <article className={cnWorkoutComparisonRow()}>
      <WorkoutComparisonRowHeader
        clientId={clientId}
        exerciseId={row.exerciseId}
        exerciseName={row.exerciseName}
        status={row.status}
      />
      <WorkoutComparisonLine label='план' value={row.planText} />
      <WorkoutComparisonLine label='факт' value={row.factText} />
      <WorkoutComparisonLine
        label='объём'
        value={`${formatVolumeKg(row.planVolumeKg)} → ${formatVolumeKg(row.factVolumeKg)} кг (${formatVolumeDeltaKg(row.factVolumeKg - row.planVolumeKg)})`}
      />
    </article>
  );
};
