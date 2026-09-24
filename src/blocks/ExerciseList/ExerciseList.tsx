import { type FC, type SyntheticEvent, useCallback } from 'react';
import { cn } from '@bem-react/classname';

import type { Exercise } from '../../services/exercises/exercises.models';
import { Button } from '../Button/Button';

import './ExerciseList.scss';

const cnExerciseList = cn('ExerciseList');

type ExerciseListProps = {
  readonly exercises: readonly Exercise[];
  readonly isSearchActive: boolean;
  onEdit(exercise: Exercise): void;
  onArchive(exercise: Exercise): void;
};

export const ExerciseList: FC<ExerciseListProps> = ({ exercises, isSearchActive, onEdit, onArchive }) => {
  const handleRowClick = useCallback(
    (event: SyntheticEvent<HTMLButtonElement>) => {
      const exerciseId = event.currentTarget.dataset.exerciseId;
      const exercise = exercises.find(item => item.id === exerciseId);
      if (exercise !== undefined) {
        onEdit(exercise);
      }
    },
    [exercises, onEdit]
  );

  const handleArchiveClick = useCallback(
    (event: SyntheticEvent<HTMLButtonElement>) => {
      const listItem = event.currentTarget.closest('li');
      const exerciseId = listItem?.querySelector<HTMLElement>('[data-exercise-id]')?.dataset.exerciseId;
      const exercise = exercises.find(item => item.id === exerciseId);
      if (exercise !== undefined) {
        onArchive(exercise);
      }
    },
    [exercises, onArchive]
  );

  return (
    <section className={cnExerciseList()}>
      <h2 className={cnExerciseList('SectionTitle')}>Справочник</h2>
      {exercises.length === 0 ? (
        <p className={cnExerciseList('Empty')}>{isSearchActive ? 'Ничего не найдено' : 'Добавить упражнение'}</p>
      ) : (
        <ul className={cnExerciseList('List')}>
          {exercises.map(exercise => (
            <li key={exercise.id} className={cnExerciseList('ListItem')}>
              <button
                className={cnExerciseList('Row')}
                data-exercise-id={exercise.id}
                onClick={handleRowClick}
                type='button'
              >
                <span className={cnExerciseList('RowName')}>{exercise.name}</span>
                <span aria-hidden='true' className={cnExerciseList('RowChevron')}>
                  ›
                </span>
              </button>
              <Button
                aria-label={`Архивировать ${exercise.name}`}
                className={cnExerciseList('ArchiveButton')}
                onClick={handleArchiveClick}
                type='button'
              >
                Архив
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
