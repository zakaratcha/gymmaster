import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';

import './WorkoutSession-AddSet.scss';

const cnWorkoutSessionAddSet = cn('WorkoutSession', 'AddSet');

type WorkoutSessionAddSetProps = {
  readonly disabled: boolean;
  readonly exercisePosition: number;
  onAdd(): void;
};

export const WorkoutSessionAddSet: FC<WorkoutSessionAddSetProps> = ({ disabled, exercisePosition, onAdd }) => {
  return (
    <Button
      aria-label={`Добавить подход в упражнение ${exercisePosition + 1}`}
      className={cnWorkoutSessionAddSet()}
      disabled={disabled}
      onClick={onAdd}
      type='button'
    >
      + Подход
    </Button>
  );
};
