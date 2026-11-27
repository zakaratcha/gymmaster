import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { PreviousWorkoutComparisonLineLabel } from '../LineLabel/PreviousWorkoutComparison-LineLabel';
import { PreviousWorkoutComparisonLineValue } from '../LineValue/PreviousWorkoutComparison-LineValue';

import './PreviousWorkoutComparison-Line.scss';

const cnPreviousWorkoutComparisonLine = cn('PreviousWorkoutComparison', 'Line');

type PreviousWorkoutComparisonLineProps = {
  readonly label: string;
  readonly value: string;
  readonly tone?: 'positive' | 'negative';
};

export const PreviousWorkoutComparisonLine: FC<PreviousWorkoutComparisonLineProps> = ({ label, value, tone }) => {
  return (
    <div className={cnPreviousWorkoutComparisonLine()}>
      <PreviousWorkoutComparisonLineLabel>{label}</PreviousWorkoutComparisonLineLabel>
      <PreviousWorkoutComparisonLineValue tone={tone}>{value}</PreviousWorkoutComparisonLineValue>
    </div>
  );
};
