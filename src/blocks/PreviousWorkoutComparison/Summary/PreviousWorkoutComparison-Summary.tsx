import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { formatVolumeDeltaKg, formatVolumeKg } from '../../../services/util/format.utils';
import type { PreviousWorkoutComparison } from '../../../services/workoutSessions/previousWorkoutComparison.models';
import { PreviousWorkoutComparisonLine } from '../Line/PreviousWorkoutComparison-Line';

import './PreviousWorkoutComparison-Summary.scss';

const cnPreviousWorkoutComparisonSummary = cn('PreviousWorkoutComparison', 'Summary');

type PreviousWorkoutComparisonSummaryProps = {
  readonly comparison: PreviousWorkoutComparison;
};

export const PreviousWorkoutComparisonSummary: FC<PreviousWorkoutComparisonSummaryProps> = ({ comparison }) => {
  const deltaKg = comparison.currentVolumeKg - comparison.previousVolumeKg;

  return (
    <section className={cnPreviousWorkoutComparisonSummary()}>
      <PreviousWorkoutComparisonLine label='прошлая' value={`${formatVolumeKg(comparison.previousVolumeKg)} кг`} />
      <PreviousWorkoutComparisonLine label='текущая' value={`${formatVolumeKg(comparison.currentVolumeKg)} кг`} />
      <PreviousWorkoutComparisonLine label='Δ объём' value={formatVolumeDeltaKg(deltaKg)} />
    </section>
  );
};
