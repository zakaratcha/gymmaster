import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';
import { WorkoutSessionError } from '../Error/WorkoutSession-Error';

import './WorkoutSession-ErrorBlock.scss';

const cnWorkoutSessionErrorBlock = cn('WorkoutSession', 'ErrorBlock');

type WorkoutSessionErrorBlockProps = {
  readonly error: string;
  onRetry(): void;
};

export const WorkoutSessionErrorBlock: FC<WorkoutSessionErrorBlockProps> = ({ error, onRetry }) => {
  return (
    <div className={cnWorkoutSessionErrorBlock()}>
      <WorkoutSessionError error={error} />
      <Button color='secondary' onClick={onRetry} type='button'>
        Повторить
      </Button>
    </div>
  );
};
