import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutSession-FormError.scss';

const cnWorkoutSessionFormError = cn('WorkoutSession', 'FormError');

type WorkoutSessionFormErrorProps = {
  readonly children: ReactNode;
};

export const WorkoutSessionFormError: FC<WorkoutSessionFormErrorProps> = ({ children }) => {
  return (
    <p className={cnWorkoutSessionFormError()} role='alert'>
      {children}
    </p>
  );
};
