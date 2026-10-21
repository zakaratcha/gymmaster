import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutComparison-LineLabel.scss';

const cnWorkoutComparisonLineLabel = cn('WorkoutComparison', 'LineLabel');

type WorkoutComparisonLineLabelProps = {
  readonly children: ReactNode;
};

export const WorkoutComparisonLineLabel: FC<WorkoutComparisonLineLabelProps> = ({ children }) => {
  return <span className={cnWorkoutComparisonLineLabel()}>{children}</span>;
};
