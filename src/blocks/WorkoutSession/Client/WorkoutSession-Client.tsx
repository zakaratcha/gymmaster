import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutSession-Client.scss';

const cnWorkoutSessionClient = cn('WorkoutSession', 'Client');

type WorkoutSessionClientProps = {
  readonly children: ReactNode;
};

export const WorkoutSessionClient: FC<WorkoutSessionClientProps> = ({ children }) => {
  return <span className={cnWorkoutSessionClient()}>{children}</span>;
};
