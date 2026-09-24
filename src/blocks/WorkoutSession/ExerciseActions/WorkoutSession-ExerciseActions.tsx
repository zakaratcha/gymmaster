import { type FC, useCallback } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';
import type { ExerciseAction } from '../types';

import './WorkoutSession-ExerciseActions.scss';

const cnWorkoutSessionExerciseActions = cn('WorkoutSession', 'ExerciseActions');

type WorkoutSessionExerciseActionProps = {
  readonly action: ExerciseAction;
  readonly disabled: boolean;
  readonly exerciseName: string;
  readonly exercisePosition: number;
  onAction(action: ExerciseAction, exercisePosition: number): void;
};

const WorkoutSessionExerciseAction: FC<WorkoutSessionExerciseActionProps> = ({
  action,
  disabled,
  exerciseName,
  exercisePosition,
  onAction
}) => {
  const handleClick = useCallback(() => {
    onAction(action, exercisePosition);
  }, [action, exercisePosition, onAction]);

  const isRemove = action === 'remove';
  const direction = action === 'up' ? 'вверх' : 'вниз';
  const ariaLabel = isRemove
    ? `Удалить упражнение ${exerciseName}`
    : `Переместить упражнение ${exerciseName} ${direction}`;
  let content = '↓';
  if (action === 'up') {
    content = '↑';
  }
  if (isRemove) {
    content = 'Удалить';
  }

  return (
    <Button aria-label={ariaLabel} color={isRemove ? 'secondary' : 'default'} disabled={disabled} onClick={handleClick}>
      {content}
    </Button>
  );
};

type WorkoutSessionExerciseActionsProps = {
  readonly draftCount: number;
  readonly exerciseName: string;
  readonly exercisePosition: number;
  readonly mutationDisabled: boolean;
  onAction(action: ExerciseAction, exercisePosition: number): void;
};

export const WorkoutSessionExerciseActions: FC<WorkoutSessionExerciseActionsProps> = ({
  draftCount,
  exerciseName,
  exercisePosition,
  mutationDisabled,
  onAction
}) => {
  return (
    <div className={cnWorkoutSessionExerciseActions()}>
      <WorkoutSessionExerciseAction
        action='up'
        disabled={exercisePosition === 0 || mutationDisabled}
        exerciseName={exerciseName}
        exercisePosition={exercisePosition}
        onAction={onAction}
      />
      <WorkoutSessionExerciseAction
        action='down'
        disabled={exercisePosition === draftCount - 1 || mutationDisabled}
        exerciseName={exerciseName}
        exercisePosition={exercisePosition}
        onAction={onAction}
      />
      <WorkoutSessionExerciseAction
        action='remove'
        disabled={mutationDisabled}
        exerciseName={exerciseName}
        exercisePosition={exercisePosition}
        onAction={onAction}
      />
    </div>
  );
};
