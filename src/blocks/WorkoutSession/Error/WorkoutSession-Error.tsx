import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutSession-Error.scss';

const cnWorkoutSessionError = cn('WorkoutSession', 'Error');

type WorkoutSessionErrorProps = {
  readonly error: string;
};

export const WorkoutSessionError: FC<WorkoutSessionErrorProps> = ({ error }) => {
  return (
    <p className={cnWorkoutSessionError()} role='alert'>
      {error}
    </p>
  );
};
