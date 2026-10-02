import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutSession-Empty.scss';

const cnWorkoutSessionEmpty = cn('WorkoutSession', 'Empty');

type WorkoutSessionEmptyProps = {
  readonly children: ReactNode;
};

export const WorkoutSessionEmpty: FC<WorkoutSessionEmptyProps> = ({ children }) => {
  return <p className={cnWorkoutSessionEmpty()}>{children}</p>;
};
