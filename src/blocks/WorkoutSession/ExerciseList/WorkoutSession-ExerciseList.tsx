import { type ChangeEvent, type FC } from 'react';
import { cn } from '@bem-react/classname';

import type { Exercise } from '../../../services/exercises/exercises.models';
import { Button } from '../../Button/Button';
import { WorkoutSessionAddExercise } from '../AddExercise/WorkoutSession-AddExercise';
import { WorkoutSessionEmpty } from '../Empty/WorkoutSession-Empty';
import { WorkoutSessionExerciseCard } from '../ExerciseCard/WorkoutSession-ExerciseCard';
import { WorkoutSessionExerciseSelect } from '../ExerciseSelect/WorkoutSession-ExerciseSelect';
import { WorkoutSessionExercisesHeader } from '../ExercisesHeader/WorkoutSession-ExercisesHeader';
import { WorkoutSessionSectionTitle } from '../SectionTitle/WorkoutSession-SectionTitle';
import type { DraftExercise, ExerciseAction, SetAction, SetField } from '../types';

import './WorkoutSession-ExerciseList.scss';

const cnWorkoutSessionExerciseList = cn('WorkoutSession', 'ExerciseList');

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
      <WorkoutSessionExercisesHeader>
        <WorkoutSessionSectionTitle>Фактические упражнения</WorkoutSessionSectionTitle>
        {isInProgress && (
          <WorkoutSessionAddExercise>
            <WorkoutSessionExerciseSelect
              disabled={exercises.length === 0 || mutationDisabled}
              exercises={exercises}
              selectedExerciseId={selectedExerciseId}
              onChange={onExerciseChange}
            />
            <Button disabled={exercises.length === 0 || mutationDisabled} onClick={onAddExercise} type='button'>
              + Упражнение
            </Button>
          </WorkoutSessionAddExercise>
        )}
      </WorkoutSessionExercisesHeader>

      {drafts.length === 0 && <WorkoutSessionEmpty>Упражнения не добавлены</WorkoutSessionEmpty>}

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
    </section>
  );
};
