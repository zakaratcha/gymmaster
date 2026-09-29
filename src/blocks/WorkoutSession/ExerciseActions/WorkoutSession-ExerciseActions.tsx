import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { WorkoutSessionExerciseAction } from '../ExerciseAction/WorkoutSession-ExerciseAction';
import type { ExerciseAction } from '../types';

import './WorkoutSession-ExerciseActions.scss';

const cnWorkoutSessionExerciseActions = cn('WorkoutSession', 'ExerciseActions');

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
