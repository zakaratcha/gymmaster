import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { WorkoutComparisonLineLabel } from '../LineLabel/WorkoutComparison-LineLabel';
import { WorkoutComparisonLineValue, type WorkoutComparisonTone } from '../LineValue/WorkoutComparison-LineValue';

import './WorkoutComparison-Line.scss';

const cnWorkoutComparisonLine = cn('WorkoutComparison', 'Line');

type WorkoutComparisonLineProps = {
  readonly label: string;
  readonly value: string;
  readonly tone?: WorkoutComparisonTone;
};

export const WorkoutComparisonLine: FC<WorkoutComparisonLineProps> = ({ label, value, tone }) => {
  return (
    <div className={cnWorkoutComparisonLine()}>
      <WorkoutComparisonLineLabel>{label}</WorkoutComparisonLineLabel>
      <WorkoutComparisonLineValue tone={tone}>{value}</WorkoutComparisonLineValue>
    </div>
  );
};
