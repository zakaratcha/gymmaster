import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutSession-StartedAt.scss';

const cnWorkoutSessionStartedAt = cn('WorkoutSession', 'StartedAt');

type WorkoutSessionStartedAtProps = {
  readonly children: ReactNode;
};

export const WorkoutSessionStartedAt: FC<WorkoutSessionStartedAtProps> = ({ children }) => {
  return <span className={cnWorkoutSessionStartedAt()}>{children}</span>;
};
