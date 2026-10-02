import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutSession-CompletedAt.scss';

const cnWorkoutSessionCompletedAt = cn('WorkoutSession', 'CompletedAt');

type WorkoutSessionCompletedAtProps = {
  readonly children: ReactNode;
};

export const WorkoutSessionCompletedAt: FC<WorkoutSessionCompletedAtProps> = ({ children }) => {
  return <span className={cnWorkoutSessionCompletedAt()}>{children}</span>;
};
