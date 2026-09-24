import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';

import './WorkoutSession-Complete.scss';

const cnWorkoutSessionComplete = cn('WorkoutSession', 'Complete');

type WorkoutSessionCompleteProps = {
  readonly completing: boolean;
  readonly disabled: boolean;
  onClick(): void;
};

export const WorkoutSessionComplete: FC<WorkoutSessionCompleteProps> = ({ completing, disabled, onClick }) => {
  return (
    <Button className={cnWorkoutSessionComplete()} color='primary' disabled={disabled} onClick={onClick} type='button'>
      {completing ? 'Завершение…' : 'Завершить тренировку'}
    </Button>
  );
};
