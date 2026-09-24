import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutSession-SetUnit.scss';

const cnWorkoutSessionSetUnit = cn('WorkoutSession', 'SetUnit');

type WorkoutSessionSetUnitProps = {
  readonly children: ReactNode;
};

export const WorkoutSessionSetUnit: FC<WorkoutSessionSetUnitProps> = ({ children }) => {
  return <span className={cnWorkoutSessionSetUnit()}>{children}</span>;
};
