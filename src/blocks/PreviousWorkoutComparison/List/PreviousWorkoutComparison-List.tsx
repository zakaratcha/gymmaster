import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import type { PreviousWorkoutComparisonRow as RowModel } from '../../../services/workoutSessions/previousWorkoutComparison.models';
import { PreviousWorkoutComparisonRow } from '../Row/PreviousWorkoutComparison-Row';

import './PreviousWorkoutComparison-List.scss';

const cnPreviousWorkoutComparisonList = cn('PreviousWorkoutComparison', 'List');

type PreviousWorkoutComparisonListProps = {
  readonly rows: readonly RowModel[];
};

export const PreviousWorkoutComparisonList: FC<PreviousWorkoutComparisonListProps> = ({ rows }) => {
  return (
    <section className={cnPreviousWorkoutComparisonList()}>
      {rows.map((row, index) => (
        <PreviousWorkoutComparisonRow key={`${row.exerciseId}-${index}`} row={row} />
      ))}
    </section>
  );
};
