import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './PreviousWorkoutComparison-Empty.scss';

const cnPreviousWorkoutComparisonEmpty = cn('PreviousWorkoutComparison', 'Empty');

type PreviousWorkoutComparisonEmptyProps = {
  readonly children: ReactNode;
};

export const PreviousWorkoutComparisonEmpty: FC<PreviousWorkoutComparisonEmptyProps> = ({ children }) => {
  return <p className={cnPreviousWorkoutComparisonEmpty()}>{children}</p>;
};
