import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';

import './ClientHub-ExerciseHistoryError.scss';

const cnClientHubExerciseHistoryError = cn('ClientHub', 'ExerciseHistoryError');

type ClientHubExerciseHistoryErrorProps = {
  readonly error: string;
  onRetry(): void;
};

export const ClientHubExerciseHistoryError: FC<ClientHubExerciseHistoryErrorProps> = ({ error, onRetry }) => {
  return (
    <div className={cnClientHubExerciseHistoryError()}>
      <p role='alert'>{error}</p>
      <Button color='secondary' onClick={onRetry} type='button'>
        Повторить
      </Button>
    </div>
  );
};
