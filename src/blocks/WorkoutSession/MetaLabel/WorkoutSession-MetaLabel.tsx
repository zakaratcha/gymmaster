import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutSession-MetaLabel.scss';

const cnWorkoutSessionMetaLabel = cn('WorkoutSession', 'MetaLabel');

type WorkoutSessionMetaLabelProps = {
  readonly children: ReactNode;
};

export const WorkoutSessionMetaLabel: FC<WorkoutSessionMetaLabelProps> = ({ children }) => {
  return <span className={cnWorkoutSessionMetaLabel()}>{children}</span>;
};
