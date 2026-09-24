import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutSession-Success.scss';

const cnWorkoutSessionSuccess = cn('WorkoutSession', 'Success');

type WorkoutSessionSuccessProps = {
  readonly children: ReactNode;
};

export const WorkoutSessionSuccess: FC<WorkoutSessionSuccessProps> = ({ children }) => {
  return (
    <p className={cnWorkoutSessionSuccess()} role='status'>
      {children}
    </p>
  );
};
