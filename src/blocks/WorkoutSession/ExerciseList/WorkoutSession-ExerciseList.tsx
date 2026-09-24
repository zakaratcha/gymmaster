import { type ChangeEvent, type FC } from 'react';
import { cn } from '@bem-react/classname';

import type { Exercise } from '../../../services/exercises/exercises.models';
import { Button } from '../../Button/Button';
import { WorkoutSessionExerciseCard } from '../ExerciseCard/WorkoutSession-ExerciseCard';
import type { DraftExercise, ExerciseAction, SetAction, SetField } from '../types';

import './WorkoutSession-ExerciseList.scss';

const cnWorkoutSessionExerciseList = cn('WorkoutSession', 'ExercisesSection');
const cnWorkoutSession = cn('WorkoutSession');

type WorkoutSessionExerciseListProps = {
  readonly drafts: readonly DraftExercise[];
  readonly exercises: readonly Exercise[];
  readonly isInProgress: boolean;
  readonly mutationDisabled: boolean;
  readonly selectedExerciseId: string;
  onAddExercise(): void;
  onExerciseAction(action: ExerciseAction, exercisePosition: number): void;
  onExerciseChange(event: ChangeEvent<HTMLSelectElement>): void;
  onSetAction(action: SetAction, exercisePosition: number, setPosition?: number): void;
  onSetChange(exercisePosition: number, setPosition: number, field: SetField, value: string): void;
};

export const WorkoutSessionExerciseList: FC<WorkoutSessionExerciseListProps> = ({
  drafts,
  exercises,
  isInProgress,
  mutationDisabled,
  selectedExerciseId,
  onAddExercise,
  onExerciseAction,
  onExerciseChange,
  onSetAction,
  onSetChange
}) => {
  return (
    <section className={cnWorkoutSessionExerciseList()}>
      <div className={cnWorkoutSession('ExercisesHeader')}>
        <h2 className={cnWorkoutSession('SectionTitle')}>Фактические упражнения</h2>
        {isInProgress && (
          <div className={cnWorkoutSession('AddExercise')}>
            <select
              aria-label='Упражнение'
              className={cnWorkoutSession('ExerciseSelect')}
              disabled={exercises.length === 0 || mutationDisabled}
              onChange={onExerciseChange}
              value={selectedExerciseId}
            >
              {exercises.map(exercise => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </select>
            <Button disabled={exercises.length === 0 || mutationDisabled} onClick={onAddExercise} type='button'>
              + Упражнение
            </Button>
          </div>
        )}
      </div>

      {drafts.length === 0 && <p className={cnWorkoutSession('Empty')}>Упражнения не добавлены</p>}

      <div className={cnWorkoutSession('ExerciseList')}>
        {drafts.map((draft, exercisePosition) => (
          <WorkoutSessionExerciseCard
            draft={draft}
            draftCount={drafts.length}
            exercisePosition={exercisePosition}
            isInProgress={isInProgress}
            key={`${draft.exerciseId}-${exercisePosition}`}
            mutationDisabled={mutationDisabled}
            onExerciseAction={onExerciseAction}
            onSetAction={onSetAction}
            onSetChange={onSetChange}
          />
        ))}
      </div>
    </section>
  );
};
