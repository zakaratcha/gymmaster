import { type FC, useCallback } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';
import type { ExerciseAction } from '../types';

import './WorkoutSession-ExerciseAction.scss';

const cnWorkoutSessionExerciseAction = cn('WorkoutSession', 'ExerciseAction');

type WorkoutSessionExerciseActionProps = {
  readonly action: ExerciseAction;
  readonly disabled: boolean;
  readonly exerciseName: string;
  readonly exercisePosition: number;
  onAction(action: ExerciseAction, exercisePosition: number): void;
};

export const WorkoutSessionExerciseAction: FC<WorkoutSessionExerciseActionProps> = ({
  action,
  disabled,
  exerciseName,
  exercisePosition,
  onAction
}) => {
  const handleClick = useCallback(() => {
    onAction(action, exercisePosition);
  }, [action, exercisePosition, onAction]);

  const remove = action === 'remove';
  const direction = action === 'up' ? 'вверх' : 'вниз';
  const ariaLabel = remove
    ? `Удалить упражнение ${exerciseName}`
    : `Переместить упражнение ${exerciseName} ${direction}`;
  let content = '↓';
  if (action === 'up') {
    content = '↑';
  }
  if (remove) {
    content = 'Удалить';
  }

  return (
    <Button
      aria-label={ariaLabel}
      className={cnWorkoutSessionExerciseAction()}
      color={remove ? 'secondary' : 'default'}
      disabled={disabled}
      onClick={handleClick}
    >
      {content}
    </Button>
  );
};
