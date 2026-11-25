import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import type { ExerciseHistoryEntry } from '../../../services/exerciseHistory/exerciseHistory.models';
import { ExerciseHistoryRow } from '../Row/ExerciseHistory-Row';

import './ExerciseHistory-Table.scss';

const cnExerciseHistoryTable = cn('ExerciseHistory', 'Table');

type ExerciseHistoryTableProps = {
  readonly entries: readonly ExerciseHistoryEntry[];
};

export const ExerciseHistoryTable: FC<ExerciseHistoryTableProps> = ({ entries }) => {
  return (
    <table className={cnExerciseHistoryTable()}>
      <thead>
        <tr>
          <th>Дата</th>
          <th>Подходы</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(entry => (
          <ExerciseHistoryRow entry={entry} key={entry.sessionId} />
        ))}
      </tbody>
    </table>
  );
};
