import { type FC, useCallback } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';
import { WorkoutSessionExerciseActions } from '../ExerciseActions/WorkoutSession-ExerciseActions';
import { WorkoutSessionSetRow } from '../SetRow/WorkoutSession-SetRow';
import type { DraftExercise, ExerciseAction, SetAction, SetField } from '../types';

import './WorkoutSession-ExerciseCard.scss';

const cnWorkoutSessionExerciseCard = cn('WorkoutSession', 'ExerciseCard');
const cnWorkoutSession = cn('WorkoutSession');

type WorkoutSessionExerciseCardProps = {
  readonly draft: DraftExercise;
  readonly draftCount: number;
  readonly exercisePosition: number;
  readonly isInProgress: boolean;
  readonly mutationDisabled: boolean;
  onExerciseAction(action: ExerciseAction, exercisePosition: number): void;
  onSetAction(action: SetAction, exercisePosition: number, setPosition?: number): void;
  onSetChange(exercisePosition: number, setPosition: number, field: SetField, value: string): void;
};

export const WorkoutSessionExerciseCard: FC<WorkoutSessionExerciseCardProps> = ({
  draft,
  draftCount,
  exercisePosition,
  isInProgress,
  mutationDisabled,
  onExerciseAction,
  onSetAction,
  onSetChange
}) => {
  const handleAddSet = useCallback(() => {
    onSetAction('add', exercisePosition);
  }, [exercisePosition, onSetAction]);

  return (
    <article className={cnWorkoutSessionExerciseCard()}>
      <div className={cnWorkoutSession('ExerciseHeader')}>
        <strong>
          {exercisePosition + 1}. {draft.exerciseName}
        </strong>
        {isInProgress && (
          <WorkoutSessionExerciseActions
            draftCount={draftCount}
            exerciseName={draft.exerciseName}
            exercisePosition={exercisePosition}
            mutationDisabled={mutationDisabled}
            onAction={onExerciseAction}
          />
        )}
      </div>

      <div className={cnWorkoutSession('SetList')}>
        {draft.sets.map((set, setPosition) => (
          <WorkoutSessionSetRow
            disabled={mutationDisabled}
            exercisePosition={exercisePosition}
            isInProgress={isInProgress}
            key={setPosition}
            onAction={onSetAction}
            onChange={onSetChange}
            set={set}
            setPosition={setPosition}
          />
        ))}
      </div>
      {isInProgress && (
        <Button
          aria-label={`Добавить подход в упражнение ${exercisePosition + 1}`}
          className={cnWorkoutSession('AddSet')}
          disabled={mutationDisabled}
          onClick={handleAddSet}
          type='button'
        >
          + Подход
        </Button>
      )}
    </article>
  );
};
