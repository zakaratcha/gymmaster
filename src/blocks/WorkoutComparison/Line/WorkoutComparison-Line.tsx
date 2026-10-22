import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { WorkoutComparisonLineLabel } from '../LineLabel/WorkoutComparison-LineLabel';
import { WorkoutComparisonLineValue } from '../LineValue/WorkoutComparison-LineValue';

import './WorkoutComparison-Line.scss';

const cnWorkoutComparisonLine = cn('WorkoutComparison', 'Line');

type WorkoutComparisonLineProps = {
  readonly label: string;
  readonly value: string;
};

export const WorkoutComparisonLine: FC<WorkoutComparisonLineProps> = ({ label, value }) => {
  return (
    <div className={cnWorkoutComparisonLine()}>
      <WorkoutComparisonLineLabel>{label}</WorkoutComparisonLineLabel>
      <WorkoutComparisonLineValue>{value}</WorkoutComparisonLineValue>
    </div>
  );
};
