import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { formatVolumeDeltaKg, toneOfDelta } from '../../../services/util/format.utils';
import type { PreviousWorkoutComparisonRow as RowModel } from '../../../services/workoutSessions/previousWorkoutComparison.models';
import { PreviousWorkoutComparisonLine } from '../Line/PreviousWorkoutComparison-Line';

import './PreviousWorkoutComparison-Row.scss';

const cnPreviousWorkoutComparisonRow = cn('PreviousWorkoutComparison', 'Row');

type PreviousWorkoutComparisonRowProps = {
  readonly row: RowModel;
};

export const PreviousWorkoutComparisonRow: FC<PreviousWorkoutComparisonRowProps> = ({ row }) => {
  return (
    <article className={cnPreviousWorkoutComparisonRow()}>
      <strong>{row.exerciseName}</strong>
      <PreviousWorkoutComparisonLine label='прошлая' value={row.previousText} />
      <PreviousWorkoutComparisonLine label='текущая' value={row.currentText} />
      <PreviousWorkoutComparisonLine
        label='Δ объём'
        tone={toneOfDelta(row.currentVolumeKg - row.previousVolumeKg)}
        value={formatVolumeDeltaKg(row.currentVolumeKg - row.previousVolumeKg)}
      />
    </article>
  );
};
