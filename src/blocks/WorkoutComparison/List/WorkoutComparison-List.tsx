import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import type { WorkoutComparisonRow as RowModel } from '../../../services/workoutSessions/workoutComparison.models';
import { WorkoutComparisonRow } from '../Row/WorkoutComparison-Row';

import './WorkoutComparison-List.scss';

const cnWorkoutComparisonList = cn('WorkoutComparison', 'List');

type WorkoutComparisonListProps = {
  readonly rows: readonly RowModel[];
};

export const WorkoutComparisonList: FC<WorkoutComparisonListProps> = ({ rows }) => {
  return (
    <section className={cnWorkoutComparisonList()}>
      {rows.map((row, index) => (
        <WorkoutComparisonRow key={`${row.exerciseId}-${index}`} row={row} />
      ))}
    </section>
  );
};
