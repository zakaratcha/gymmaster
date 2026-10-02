import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutSession-Main.scss';

const cnWorkoutSessionMain = cn('WorkoutSession', 'Main');

type WorkoutSessionMainProps = {
  readonly children: ReactNode;
};

export const WorkoutSessionMain: FC<WorkoutSessionMainProps> = ({ children }) => {
  return <main className={cnWorkoutSessionMain()}>{children}</main>;
};
