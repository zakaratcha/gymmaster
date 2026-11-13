import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutComparison-Title.scss';

const cnWorkoutComparisonTitle = cn('WorkoutComparison', 'Title');

type WorkoutComparisonTitleProps = {
  readonly children: ReactNode;
};

export const WorkoutComparisonTitle: FC<WorkoutComparisonTitleProps> = ({ children }) => {
  return <h2 className={cnWorkoutComparisonTitle()}>{children}</h2>;
};
