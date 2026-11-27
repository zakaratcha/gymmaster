import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './PreviousWorkoutComparison-LineValue.scss';

const cnPreviousWorkoutComparisonLineValue = cn('PreviousWorkoutComparison', 'LineValue');

type PreviousWorkoutComparisonLineValueProps = {
  readonly children: ReactNode;
  readonly tone?: 'positive' | 'negative';
};

export const PreviousWorkoutComparisonLineValue: FC<PreviousWorkoutComparisonLineValueProps> = ({ children, tone }) => {
  return <span className={cnPreviousWorkoutComparisonLineValue({ tone })}>{children}</span>;
};
