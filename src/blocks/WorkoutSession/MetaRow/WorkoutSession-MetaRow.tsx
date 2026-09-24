import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutSession-MetaRow.scss';

const cnWorkoutSessionMetaRow = cn('WorkoutSession', 'MetaRow');

type WorkoutSessionMetaRowProps = {
  readonly children: ReactNode;
};

export const WorkoutSessionMetaRow: FC<WorkoutSessionMetaRowProps> = ({ children }) => {
  return <div className={cnWorkoutSessionMetaRow()}>{children}</div>;
};
