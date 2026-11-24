import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import type { WorkoutComparisonStatus as WorkoutComparisonStatusValue } from '../../../services/workoutSessions/workoutComparison.models';
import { WorkoutComparisonStatus } from '../Status/WorkoutComparison-Status';

import './WorkoutComparison-RowHeader.scss';

const cnWorkoutComparisonRowHeader = cn('WorkoutComparison', 'RowHeader');

type WorkoutComparisonRowHeaderProps = {
  readonly exerciseName: string;
  readonly status: WorkoutComparisonStatusValue;
};

export const WorkoutComparisonRowHeader: FC<WorkoutComparisonRowHeaderProps> = ({ exerciseName, status }) => {
  return (
    <header className={cnWorkoutComparisonRowHeader()}>
      <strong>{exerciseName}</strong>
      <WorkoutComparisonStatus status={status} />
    </header>
  );
};
