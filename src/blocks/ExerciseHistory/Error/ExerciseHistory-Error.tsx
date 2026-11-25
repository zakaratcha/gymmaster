import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';

import './ExerciseHistory-Error.scss';

const cnExerciseHistoryError = cn('ExerciseHistory', 'Error');

type ExerciseHistoryErrorProps = {
  readonly error: string;
  onRetry(): void;
};

export const ExerciseHistoryError: FC<ExerciseHistoryErrorProps> = ({ error, onRetry }) => {
  return (
    <div className={cnExerciseHistoryError()}>
      <p role='alert'>{error}</p>
      <Button color='secondary' onClick={onRetry} type='button'>
        Повторить
      </Button>
    </div>
  );
};
