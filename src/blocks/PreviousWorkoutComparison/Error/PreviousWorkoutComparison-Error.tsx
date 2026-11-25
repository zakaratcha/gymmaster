import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';

import './PreviousWorkoutComparison-Error.scss';

const cnPreviousWorkoutComparisonError = cn('PreviousWorkoutComparison', 'Error');

type PreviousWorkoutComparisonErrorProps = {
  readonly error: string;
  onRetry(): void;
};

export const PreviousWorkoutComparisonError: FC<PreviousWorkoutComparisonErrorProps> = ({ error, onRetry }) => {
  return (
    <div className={cnPreviousWorkoutComparisonError()}>
      <p role='alert'>{error}</p>
      <Button color='secondary' onClick={onRetry} type='button'>
        Повторить
      </Button>
    </div>
  );
};
