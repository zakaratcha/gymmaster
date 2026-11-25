import { type FC } from 'react';
import { cn } from '@bem-react/classname';
import { Link } from 'react-router-dom';

import type { WorkoutComparisonStatus as WorkoutComparisonStatusValue } from '../../../services/workoutSessions/workoutComparison.models';
import { WorkoutComparisonStatus } from '../Status/WorkoutComparison-Status';

import './WorkoutComparison-RowHeader.scss';

const cnWorkoutComparisonRowHeader = cn('WorkoutComparison', 'RowHeader');

type WorkoutComparisonRowHeaderProps = {
  readonly clientId?: string;
  readonly exerciseId: string;
  readonly exerciseName: string;
  readonly status: WorkoutComparisonStatusValue;
};

export const WorkoutComparisonRowHeader: FC<WorkoutComparisonRowHeaderProps> = ({
  clientId,
  exerciseId,
  exerciseName,
  status
}) => {
  const historyPath =
    clientId === undefined
      ? undefined
      : `/clients/${encodeURIComponent(clientId)}/exercises/${encodeURIComponent(exerciseId)}/history`;

  return (
    <header className={cnWorkoutComparisonRowHeader()}>
      {historyPath === undefined ? (
        <strong>{exerciseName}</strong>
      ) : (
        <Link aria-label={`История упражнения ${exerciseName}`} to={historyPath}>
          {exerciseName}
        </Link>
      )}
      <WorkoutComparisonStatus status={status} />
    </header>
  );
};
