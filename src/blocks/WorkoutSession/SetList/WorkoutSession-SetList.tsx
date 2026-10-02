import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutSession-SetList.scss';

const cnWorkoutSessionSetList = cn('WorkoutSession', 'SetList');

type WorkoutSessionSetListProps = {
  readonly children: ReactNode;
};

export const WorkoutSessionSetList: FC<WorkoutSessionSetListProps> = ({ children }) => {
  return <div className={cnWorkoutSessionSetList()}>{children}</div>;
};
