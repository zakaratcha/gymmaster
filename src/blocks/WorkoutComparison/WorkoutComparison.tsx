import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import type { PlannedWorkout } from '../../services/plans/plans.models';
import { buildWorkoutComparison } from '../../services/workoutSessions/workoutComparison.utils';
import type { WorkoutSession } from '../../services/workoutSessions/workoutSessions.models';
import { WorkoutComparisonEmpty } from './Empty/WorkoutComparison-Empty';
import { WorkoutComparisonList } from './List/WorkoutComparison-List';
import { WorkoutComparisonSummary } from './Summary/WorkoutComparison-Summary';
import { WorkoutComparisonTitle } from './Title/WorkoutComparison-Title';

import './WorkoutComparison.scss';

const cnWorkoutComparison = cn('WorkoutComparison');

type WorkoutComparisonProps = {
  readonly plan: PlannedWorkout | null;
  readonly session: WorkoutSession;
};

export const WorkoutComparison: FC<WorkoutComparisonProps> = ({ plan, session }) => {
  if (plan === null) {
    return (
      <div className={cnWorkoutComparison()}>
        <WorkoutComparisonTitle>План ↔ Факт</WorkoutComparisonTitle>
        <WorkoutComparisonEmpty>Тренировка начата без плана — сравнение неприменимо</WorkoutComparisonEmpty>
      </div>
    );
  }

  const comparison = buildWorkoutComparison(plan, session);

  return (
    <div className={cnWorkoutComparison()}>
      <WorkoutComparisonTitle>План ↔ Факт</WorkoutComparisonTitle>
      <WorkoutComparisonSummary comparison={comparison} />
      <WorkoutComparisonList rows={comparison.rows} />
    </div>
  );
};
