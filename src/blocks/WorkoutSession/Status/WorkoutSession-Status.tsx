import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutSession-Status.scss';

const cnWorkoutSessionStatus = cn('WorkoutSession', 'Status');

type WorkoutSessionStatusProps = {
  readonly children: ReactNode;
  readonly completed: boolean;
};

export const WorkoutSessionStatus: FC<WorkoutSessionStatusProps> = ({ children, completed }) => {
  return <span className={cnWorkoutSessionStatus({ completed })}>{children}</span>;
};
