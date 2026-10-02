import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutSession-SetLabel.scss';

const cnWorkoutSessionSetLabel = cn('WorkoutSession', 'SetLabel');

type WorkoutSessionSetLabelProps = {
  readonly children: ReactNode;
};

export const WorkoutSessionSetLabel: FC<WorkoutSessionSetLabelProps> = ({ children }) => {
  return <span className={cnWorkoutSessionSetLabel()}>{children}</span>;
};
