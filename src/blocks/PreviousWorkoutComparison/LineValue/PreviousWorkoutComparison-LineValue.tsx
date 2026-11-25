import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './PreviousWorkoutComparison-LineValue.scss';

const cnPreviousWorkoutComparisonLineValue = cn('PreviousWorkoutComparison', 'LineValue');

type PreviousWorkoutComparisonLineValueProps = {
  readonly children: ReactNode;
};

export const PreviousWorkoutComparisonLineValue: FC<PreviousWorkoutComparisonLineValueProps> = ({ children }) => {
  return <span className={cnPreviousWorkoutComparisonLineValue()}>{children}</span>;
};
