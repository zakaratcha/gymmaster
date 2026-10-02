import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutSession-Split.scss';

const cnWorkoutSessionSplit = cn('WorkoutSession', 'Split');

type WorkoutSessionSplitProps = {
  readonly children: ReactNode;
};

export const WorkoutSessionSplit: FC<WorkoutSessionSplitProps> = ({ children }) => {
  return <span className={cnWorkoutSessionSplit()}>{children}</span>;
};
