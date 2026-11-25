import { type FC, useCallback } from 'react';
import { cn } from '@bem-react/classname';

import { WorkoutSessionAddSet } from '../AddSet/WorkoutSession-AddSet';
import { WorkoutSessionExerciseActions } from '../ExerciseActions/WorkoutSession-ExerciseActions';
import { WorkoutSessionExerciseHeader } from '../ExerciseHeader/WorkoutSession-ExerciseHeader';
import { WorkoutSessionExerciseHistory } from '../ExerciseHistory/WorkoutSession-ExerciseHistory';
import { WorkoutSessionSetList } from '../SetList/WorkoutSession-SetList';
import { WorkoutSessionSetRow } from '../SetRow/WorkoutSession-SetRow';
import type { DraftExercise, ExerciseAction, SetAction, SetField } from '../types';

import './WorkoutSession-ExerciseCard.scss';

const cnWorkoutSessionExerciseCard = cn('WorkoutSession', 'ExerciseCard');

type WorkoutSessionExerciseCardProps = {
  readonly draft: DraftExercise;
  readonly draftCount: number;
  readonly exercisePosition: number;
  readonly inProgress: boolean;
  readonly mutationDisabled: boolean;
  onExerciseAction(action: ExerciseAction, exercisePosition: number): void;
  onOpenHistory(exerciseId: string): void;
  onSetAction(action: SetAction, exercisePosition: number, setPosition?: number): void;
  onSetChange(exercisePosition: number, setPosition: number, field: SetField, value: string): void;
};

export const WorkoutSessionExerciseCard: FC<WorkoutSessionExerciseCardProps> = ({
  draft,
  draftCount,
  exercisePosition,
  inProgress,
  mutationDisabled,
  onExerciseAction,
  onOpenHistory,
  onSetAction,
  onSetChange
}) => {
  const handleAddSet = useCallback(() => {
    onSetAction('add', exercisePosition);
  }, [exercisePosition, onSetAction]);

  const handleOpenHistory = useCallback(() => {
    onOpenHistory(draft.exerciseId);
  }, [draft.exerciseId, onOpenHistory]);

  return (
    <article className={cnWorkoutSessionExerciseCard()}>
      <WorkoutSessionExerciseHeader>
        <strong>
          {exercisePosition + 1}. {draft.exerciseName}
        </strong>
        <WorkoutSessionExerciseHistory exerciseName={draft.exerciseName} onOpen={handleOpenHistory} />
        {inProgress && (
          <WorkoutSessionExerciseActions
            draftCount={draftCount}
            exerciseName={draft.exerciseName}
            exercisePosition={exercisePosition}
            mutationDisabled={mutationDisabled}
            onAction={onExerciseAction}
          />
        )}
      </WorkoutSessionExerciseHeader>

      <WorkoutSessionSetList>
        {draft.sets.map((set, setPosition) => (
          <WorkoutSessionSetRow
            disabled={mutationDisabled}
            exercisePosition={exercisePosition}
            inProgress={inProgress}
            key={setPosition}
            onAction={onSetAction}
            onChange={onSetChange}
            set={set}
            setPosition={setPosition}
          />
        ))}
      </WorkoutSessionSetList>
      {inProgress && (
        <WorkoutSessionAddSet disabled={mutationDisabled} exercisePosition={exercisePosition} onAdd={handleAddSet} />
      )}
    </article>
  );
};
