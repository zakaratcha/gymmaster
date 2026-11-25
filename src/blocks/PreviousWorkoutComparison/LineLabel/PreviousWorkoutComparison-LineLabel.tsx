import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './PreviousWorkoutComparison-LineLabel.scss';

const cnPreviousWorkoutComparisonLineLabel = cn('PreviousWorkoutComparison', 'LineLabel');

type PreviousWorkoutComparisonLineLabelProps = {
  readonly children: ReactNode;
};

export const PreviousWorkoutComparisonLineLabel: FC<PreviousWorkoutComparisonLineLabelProps> = ({ children }) => {
  return <span className={cnPreviousWorkoutComparisonLineLabel()}>{children}</span>;
};
