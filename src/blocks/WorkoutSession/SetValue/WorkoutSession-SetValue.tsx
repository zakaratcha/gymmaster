import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutSession-SetValue.scss';

const cnWorkoutSessionSetValue = cn('WorkoutSession', 'SetValue');

type WorkoutSessionSetValueProps = {
  readonly children: ReactNode;
};

export const WorkoutSessionSetValue: FC<WorkoutSessionSetValueProps> = ({ children }) => {
  return <span className={cnWorkoutSessionSetValue()}>{children}</span>;
};
