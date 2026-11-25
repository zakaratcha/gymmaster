import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import type { ExerciseHistoryEntry } from '../../../services/exerciseHistory/exerciseHistory.models';
import { formatSessionDate, formatSetGroupsText } from '../../../services/util/format.utils';

import './ExerciseHistory-Row.scss';

const cnExerciseHistoryRow = cn('ExerciseHistory', 'Row');

type ExerciseHistoryRowProps = {
  readonly entry: ExerciseHistoryEntry;
};

export const ExerciseHistoryRow: FC<ExerciseHistoryRowProps> = ({ entry }) => {
  return (
    <tr className={cnExerciseHistoryRow()}>
      <td>{formatSessionDate(entry.completedAt)}</td>
      <td>{formatSetGroupsText(entry.sets)}</td>
    </tr>
  );
};
