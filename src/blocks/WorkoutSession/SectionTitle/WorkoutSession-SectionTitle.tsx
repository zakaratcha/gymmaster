import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutSession-SectionTitle.scss';

const cnWorkoutSessionSectionTitle = cn('WorkoutSession', 'SectionTitle');

type WorkoutSessionSectionTitleProps = {
  readonly children: ReactNode;
};

export const WorkoutSessionSectionTitle: FC<WorkoutSessionSectionTitleProps> = ({ children }) => {
  return <h2 className={cnWorkoutSessionSectionTitle()}>{children}</h2>;
};
