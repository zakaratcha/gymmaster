import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import './ExerciseHistory-Header.scss';

const cnExerciseHistoryHeader = cn('ExerciseHistory', 'Header');

type ExerciseHistoryHeaderProps = {
  readonly closeLabel: string;
  readonly title?: string;
  onClose(): void;
};

export const ExerciseHistoryHeader: FC<ExerciseHistoryHeaderProps> = ({ closeLabel, title, onClose }) => {
  return (
    <header className={cnExerciseHistoryHeader()}>
      <button aria-label={closeLabel} type='button' onClick={onClose}>
        {closeLabel === 'Закрыть' ? '×' : '←'}
      </button>
      {title !== undefined && <h1>{title}</h1>}
    </header>
  );
};
