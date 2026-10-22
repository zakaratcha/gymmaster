import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutComparison-Empty.scss';

const cnWorkoutComparisonEmpty = cn('WorkoutComparison', 'Empty');

type WorkoutComparisonEmptyProps = {
  readonly children: ReactNode;
};

export const WorkoutComparisonEmpty: FC<WorkoutComparisonEmptyProps> = ({ children }) => {
  return <p className={cnWorkoutComparisonEmpty()}>{children}</p>;
};
