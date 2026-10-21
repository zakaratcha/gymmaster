import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutComparison-Line.scss';

const cnWorkoutComparisonLine = cn('WorkoutComparison', 'Line');
const cnWorkoutComparisonLineLabel = cn('WorkoutComparison', 'LineLabel');
const cnWorkoutComparisonLineValue = cn('WorkoutComparison', 'LineValue');

type WorkoutComparisonLineProps = {
  readonly label: string;
  readonly value: string;
};

export const WorkoutComparisonLine: FC<WorkoutComparisonLineProps> = ({ label, value }) => {
  return (
    <div className={cnWorkoutComparisonLine()}>
      <span className={cnWorkoutComparisonLineLabel()}>{label}</span>
      <span className={cnWorkoutComparisonLineValue()}>{value}</span>
    </div>
  );
};
