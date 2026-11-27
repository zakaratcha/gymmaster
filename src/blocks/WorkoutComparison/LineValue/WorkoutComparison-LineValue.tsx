import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutComparison-LineValue.scss';

const cnWorkoutComparisonLineValue = cn('WorkoutComparison', 'LineValue');

export type WorkoutComparisonTone = 'positive' | 'negative';

type WorkoutComparisonLineValueProps = {
  readonly children: ReactNode;
  readonly tone?: WorkoutComparisonTone;
};

export const WorkoutComparisonLineValue: FC<WorkoutComparisonLineValueProps> = ({ children, tone }) => {
  return <span className={cnWorkoutComparisonLineValue({ tone })}>{children}</span>;
};
