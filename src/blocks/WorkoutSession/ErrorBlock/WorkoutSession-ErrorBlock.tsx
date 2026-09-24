import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';

import './WorkoutSession-ErrorBlock.scss';

const cnWorkoutSessionErrorBlock = cn('WorkoutSession', 'ErrorBlock');
const cnWorkoutSession = cn('WorkoutSession');

type WorkoutSessionErrorBlockProps = {
  readonly error: string;
  onRetry(): void;
};

export const WorkoutSessionErrorBlock: FC<WorkoutSessionErrorBlockProps> = ({ error, onRetry }) => {
  return (
    <div className={cnWorkoutSessionErrorBlock()}>
      <p className={cnWorkoutSession('Error')} role='alert'>
        {error}
      </p>
      <Button color='secondary' onClick={onRetry} type='button'>
        Повторить
      </Button>
    </div>
  );
};
