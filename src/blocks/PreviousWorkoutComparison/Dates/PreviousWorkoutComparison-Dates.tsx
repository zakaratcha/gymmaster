import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { formatSessionDate } from '../../../services/util/format.utils';

import './PreviousWorkoutComparison-Dates.scss';

const cnPreviousWorkoutComparisonDates = cn('PreviousWorkoutComparison', 'Dates');

type PreviousWorkoutComparisonDatesProps = {
  readonly currentCompletedAt: string;
  readonly previousCompletedAt: string;
};

export const PreviousWorkoutComparisonDates: FC<PreviousWorkoutComparisonDatesProps> = ({
  currentCompletedAt,
  previousCompletedAt
}) => {
  return (
    <p className={cnPreviousWorkoutComparisonDates()}>
      Текущая: {formatSessionDate(currentCompletedAt)} · Прошлая: {formatSessionDate(previousCompletedAt)}
    </p>
  );
};
