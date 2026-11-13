import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutComparison-LineValue.scss';

const cnWorkoutComparisonLineValue = cn('WorkoutComparison', 'LineValue');

type WorkoutComparisonLineValueProps = {
  readonly children: ReactNode;
};

export const WorkoutComparisonLineValue: FC<WorkoutComparisonLineValueProps> = ({ children }) => {
  return <span className={cnWorkoutComparisonLineValue()}>{children}</span>;
};
