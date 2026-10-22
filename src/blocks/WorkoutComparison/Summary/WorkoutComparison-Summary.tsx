import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { formatVolumeDeltaKg, formatVolumeKg, formatWorkoutCount } from '../../../services/util/format.utils';
import type {
  WorkoutComparison,
  WorkoutComparisonTotals
} from '../../../services/workoutSessions/workoutComparison.models';
import { WorkoutComparisonLine } from '../Line/WorkoutComparison-Line';

import './WorkoutComparison-Summary.scss';

const cnWorkoutComparisonSummary = cn('WorkoutComparison', 'Summary');

type WorkoutComparisonSummaryProps = {
  readonly comparison: WorkoutComparison;
};

function formatTotals(totals: WorkoutComparisonTotals): string {
  const exercises = formatWorkoutCount(totals.exerciseCount, 'упражнение', 'упражнения', 'упражнений');
  const sets = formatWorkoutCount(totals.setCount, 'подход', 'подхода', 'подходов');

  return `${exercises} · ${sets} · ${formatVolumeKg(totals.volumeKg)} кг`;
}

export const WorkoutComparisonSummary: FC<WorkoutComparisonSummaryProps> = ({ comparison }) => {
  const { planTotals, factTotals } = comparison;
  const deltaKg = factTotals.volumeKg - planTotals.volumeKg;

  return (
    <section className={cnWorkoutComparisonSummary()}>
      <WorkoutComparisonLine label='план' value={formatTotals(planTotals)} />
      <WorkoutComparisonLine label='факт' value={formatTotals(factTotals)} />
      <WorkoutComparisonLine label='Δ объём' value={formatVolumeDeltaKg(deltaKg)} />
    </section>
  );
};
