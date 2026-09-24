import { type ChangeEvent, type FC, type SyntheticEvent, useCallback, useEffect } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';
import { Link, useNavigate, useParams } from 'react-router-dom';

import type { Exercise } from '../../services/exercises/exercises.models';
import { listExercises } from '../../services/exercises/exercises.service';
import type {
  CreatePlannedWorkoutRequest,
  PlannedExerciseInput,
  PlannedSetInput,
  PlannedWorkout
} from '../../services/plans/plans.models';
import { createPlan, getPlanById, updatePlan } from '../../services/plans/plans.service';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Loading } from '../Loading/Loading';

import './PlannedWorkoutEditor.scss';

const cnPlannedWorkoutEditor = cn('PlannedWorkoutEditor');

type DraftSet = {
  reps: string;
  weightKg: string;
};

type DraftExercise = {
  exerciseId: string;
  exerciseName: string;
  sets: DraftSet[];
};

type PlannedWorkoutEditorState = {
  plannedDate: string;
  splitTag: string;
  exercises: readonly Exercise[];
  drafts: DraftExercise[];
  selectedExerciseId: string;
  plan?: PlannedWorkout;
  loading: boolean;
  error?: string;
  formError?: string;
  submitting: boolean;
  setPlannedDate(value: string): void;
  setSplitTag(value: string): void;
  setExercises(value: readonly Exercise[]): void;
  setDrafts(value: DraftExercise[]): void;
  setSelectedExerciseId(value: string): void;
  setPlan(value: PlannedWorkout | undefined): void;
  setLoading(value: boolean): void;
  setError(value: string | undefined): void;
  setFormError(value: string | undefined): void;
  setSubmitting(value: boolean): void;
  addExercise(exerciseId: string, exerciseName: string): void;
  removeExercise(position: number): void;
  moveExercise(from: number, to: number): void;
  addSet(exercisePosition: number): void;
  removeSet(exercisePosition: number, setPosition: number): void;
  setSetValue(exercisePosition: number, setPosition: number, field: keyof DraftSet, value: string): void;
};

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [yearText, monthText, dayText] = value.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function buildPayload(
  plannedDate: string,
  splitTag: string,
  drafts: readonly DraftExercise[]
): { readonly payload: CreatePlannedWorkoutRequest } | { readonly error: string } {
  if (!isValidDate(plannedDate)) {
    return { error: 'Укажите корректную дату' };
  }

  const normalizedTag = splitTag.trim();
  if (normalizedTag.length === 0) {
    return { error: 'Укажите тег тренировки' };
  }

  const exercises: PlannedExerciseInput[] = [];
  for (const draft of drafts) {
    const sets: PlannedSetInput[] = [];
    for (const set of draft.sets) {
      const repsValue = set.reps.trim();
      const weightValue = set.weightKg.trim();
      const reps = Number(repsValue);
      const weightKg = Number(weightValue);
      if (repsValue.length === 0 || !Number.isInteger(reps) || reps <= 0) {
        return { error: `Повторы для «${draft.exerciseName}» должны быть положительным целым числом` };
      }
      if (weightValue.length === 0 || !Number.isFinite(weightKg) || weightKg < 0) {
        return { error: `Вес для «${draft.exerciseName}» должен быть неотрицательным числом` };
      }

      sets.push({ reps, weightKg });
    }

    exercises.push({ exerciseId: draft.exerciseId, sets });
  }

  return { payload: { plannedDate, splitTag: normalizedTag, exercises } };
}

function toDraftExercises(plan: PlannedWorkout): DraftExercise[] {
  return plan.exercises.map(exercise => ({
    exerciseId: exercise.exerciseId,
    exerciseName: exercise.exerciseName,
    sets: exercise.sets.map(set => ({ reps: `${set.reps}`, weightKg: `${set.weightKg}` }))
  }));
}

export const PlannedWorkoutEditor: FC = observer(() => {
  const navigate = useNavigate();
  const { id: clientId, planId } = useParams<{ id: string; planId: string }>();
  const isEditing = planId !== undefined && planId !== 'new';
  const state = useLocalObservable<PlannedWorkoutEditorState>(() => ({
    plannedDate: formatDateInput(new Date()),
    splitTag: '',
    exercises: [],
    drafts: [],
    selectedExerciseId: '',
    loading: true,
    submitting: false,
    setPlannedDate(value) {
      this.plannedDate = value;
    },
    setSplitTag(value) {
      this.splitTag = value;
    },
    setExercises(value) {
      this.exercises = value;
    },
    setDrafts(value) {
      this.drafts = value;
    },
    setSelectedExerciseId(value) {
      this.selectedExerciseId = value;
    },
    setPlan(value) {
      this.plan = value;
    },
    setLoading(value) {
      this.loading = value;
    },
    setError(value) {
      this.error = value;
    },
    setFormError(value) {
      this.formError = value;
    },
    setSubmitting(value) {
      this.submitting = value;
    },
    addExercise(exerciseId, exerciseName) {
      this.drafts = [
        ...this.drafts,
        {
          exerciseId,
          exerciseName,
          sets: [{ reps: '', weightKg: '' }]
        }
      ];
    },
    removeExercise(position) {
      this.drafts = this.drafts.filter((_, index) => index !== position);
    },
    moveExercise(from, to) {
      if (from === to || from < 0 || to < 0 || from >= this.drafts.length || to >= this.drafts.length) {
        return;
      }

      const next = [...this.drafts];
      const [moved] = next.splice(from, 1);
      if (moved !== undefined) {
        next.splice(to, 0, moved);
        this.drafts = next;
      }
    },
    addSet(exercisePosition) {
      this.drafts = this.drafts.map((draft, index) =>
        index === exercisePosition ? { ...draft, sets: [...draft.sets, { reps: '', weightKg: '' }] } : draft
      );
    },
    removeSet(exercisePosition, setPosition) {
      const next: DraftExercise[] = [];
      for (let index = 0; index < this.drafts.length; index += 1) {
        const draft = this.drafts[index];
        if (draft === undefined || index !== exercisePosition) {
          if (draft !== undefined) {
            next.push(draft);
          }
          continue;
        }

        const sets: DraftSet[] = [];
        for (let setIndex = 0; setIndex < draft.sets.length; setIndex += 1) {
          if (setIndex !== setPosition) {
            const set = draft.sets[setIndex];
            if (set !== undefined) {
              sets.push(set);
            }
          }
        }
        next.push({ ...draft, sets });
      }
      this.drafts = next;
    },
    setSetValue(exercisePosition, setPosition, field, value) {
      const next: DraftExercise[] = [];
      for (let index = 0; index < this.drafts.length; index += 1) {
        const draft = this.drafts[index];
        if (draft === undefined || index !== exercisePosition) {
          if (draft !== undefined) {
            next.push(draft);
          }
          continue;
        }

        const sets: DraftSet[] = [];
        for (let setIndex = 0; setIndex < draft.sets.length; setIndex += 1) {
          const set = draft.sets[setIndex];
          if (set === undefined) {
            continue;
          }
          sets.push(setIndex === setPosition ? { ...set, [field]: value } : set);
        }
        next.push({ ...draft, sets });
      }
      this.drafts = next;
    }
  }));

  const loadEditor = useCallback(async () => {
    if (clientId === undefined || clientId.length === 0) {
      state.setError('Клиент не найден');
      state.setLoading(false);
      return;
    }

    state.setLoading(true);
    state.setError(undefined);
    try {
      const exercises = await listExercises();
      state.setExercises(exercises);
      state.setSelectedExerciseId(exercises[0]?.id ?? '');

      if (isEditing && planId !== undefined) {
        const plan = await getPlanById(clientId, planId);
        state.setPlan(plan);
        state.setPlannedDate(plan.plannedDate);
        state.setSplitTag(plan.splitTag);
        state.setDrafts(toDraftExercises(plan));
      }
    } catch {
      state.setError('Не удалось загрузить план');
    } finally {
      state.setLoading(false);
    }
  }, [clientId, isEditing, planId, state]);

  useEffect(() => {
    void loadEditor();
  }, [loadEditor]);

  const handleDateChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      state.setPlannedDate(event.target.value);
    },
    [state]
  );

  const handleTagChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      state.setSplitTag(event.target.value);
    },
    [state]
  );

  const handleExerciseChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      state.setSelectedExerciseId(event.target.value);
    },
    [state]
  );

  const handleAddExercise = useCallback(() => {
    const selected = state.exercises.find(exercise => exercise.id === state.selectedExerciseId);
    if (selected === undefined) {
      state.setFormError('Выберите упражнение');
      return;
    }

    state.setFormError(undefined);
    state.addExercise(selected.id, selected.name);
  }, [state]);

  const handleExerciseAction = useCallback(
    (event: SyntheticEvent<HTMLButtonElement>) => {
      const exercisePosition = Number(event.currentTarget.dataset.exercisePosition);
      const action = event.currentTarget.dataset.action;
      if (action === 'up') {
        state.moveExercise(exercisePosition, exercisePosition - 1);
      }
      if (action === 'down') {
        state.moveExercise(exercisePosition, exercisePosition + 1);
      }
      if (action === 'remove') {
        state.removeExercise(exercisePosition);
      }
    },
    [state]
  );

  const handleSetAction = useCallback(
    (event: SyntheticEvent<HTMLButtonElement>) => {
      const exercisePosition = Number(event.currentTarget.dataset.exercisePosition);
      const setPosition = Number(event.currentTarget.dataset.setPosition);
      const action = event.currentTarget.dataset.action;
      if (action === 'add') {
        state.addSet(exercisePosition);
      }
      if (action === 'remove') {
        state.removeSet(exercisePosition, setPosition);
      }
    },
    [state]
  );

  const handleSetChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const exercisePosition = Number(event.currentTarget.dataset.exercisePosition);
      const setPosition = Number(event.currentTarget.dataset.setPosition);
      const field = event.currentTarget.dataset.field;
      if (field === 'reps' || field === 'weightKg') {
        state.setSetValue(exercisePosition, setPosition, field, event.currentTarget.value);
      }
    },
    [state]
  );

  const handleSubmit = useCallback(
    async (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (clientId === undefined || state.submitting) {
        return;
      }

      const result = buildPayload(state.plannedDate, state.splitTag, state.drafts);
      if ('error' in result) {
        state.setFormError(result.error);
        return;
      }

      state.setFormError(undefined);
      state.setSubmitting(true);
      try {
        await (isEditing && planId !== undefined
          ? updatePlan(clientId, planId, result.payload)
          : createPlan(clientId, result.payload));
        void navigate(`/clients/${clientId}/plans`);
      } catch {
        state.setFormError('Не удалось сохранить план');
      } finally {
        state.setSubmitting(false);
      }
    },
    [clientId, isEditing, navigate, planId, state]
  );

  return (
    <div className={cnPlannedWorkoutEditor()}>
      <main className={cnPlannedWorkoutEditor('Main')}>
        <header className={cnPlannedWorkoutEditor('Header')}>
          <Link
            aria-label='Назад к планам'
            className={cnPlannedWorkoutEditor('Back')}
            to={clientId === undefined ? '/clients' : `/clients/${clientId}/plans`}
          >
            ←
          </Link>
          <h1 className={cnPlannedWorkoutEditor('Title')}>{isEditing ? 'План тренировки' : 'Новый план'}</h1>
          <Button
            className={cnPlannedWorkoutEditor('Save')}
            disabled={state.loading}
            form='plan-editor-form'
            type='submit'
          >
            {state.submitting ? 'Сохранение…' : 'Сохранить'}
          </Button>
        </header>

        {state.loading && <Loading className={cnPlannedWorkoutEditor('Loading')} visible />}

        {state.error !== undefined && (
          <div className={cnPlannedWorkoutEditor('ErrorBlock')}>
            <p>{state.error}</p>
            <Button color='secondary' onClick={loadEditor}>
              Повторить
            </Button>
          </div>
        )}

        {!state.loading && state.error === undefined && (
          <form className={cnPlannedWorkoutEditor('Form')} id='plan-editor-form' onSubmit={handleSubmit}>
            <Input
              className={cnPlannedWorkoutEditor('Field')}
              id='planned-date'
              label='Дата'
              onChange={handleDateChange}
              type='date'
              value={state.plannedDate}
            />
            <Input
              className={cnPlannedWorkoutEditor('Field')}
              id='split-tag'
              label='Тег дня'
              onChange={handleTagChange}
              placeholder='ноги'
              value={state.splitTag}
            />

            <section className={cnPlannedWorkoutEditor('ExercisesSection')}>
              <div className={cnPlannedWorkoutEditor('ExercisesHeader')}>
                <h2 className={cnPlannedWorkoutEditor('SectionTitle')}>Упражнения</h2>
                <div className={cnPlannedWorkoutEditor('AddExercise')}>
                  <select
                    aria-label='Упражнение'
                    className={cnPlannedWorkoutEditor('ExerciseSelect')}
                    disabled={state.exercises.length === 0}
                    onChange={handleExerciseChange}
                    value={state.selectedExerciseId}
                  >
                    {state.exercises.map(exercise => (
                      <option key={exercise.id} value={exercise.id}>
                        {exercise.name}
                      </option>
                    ))}
                  </select>
                  <Button disabled={state.exercises.length === 0} onClick={handleAddExercise}>
                    + Упражнение
                  </Button>
                </div>
              </div>

              {state.drafts.length === 0 && <p className={cnPlannedWorkoutEditor('Empty')}>Упражнения не добавлены</p>}

              <div className={cnPlannedWorkoutEditor('ExerciseList')}>
                {state.drafts.map((draft, exercisePosition) => (
                  <article
                    className={cnPlannedWorkoutEditor('ExerciseCard')}
                    key={`${draft.exerciseId}-${exercisePosition}`}
                  >
                    <div className={cnPlannedWorkoutEditor('ExerciseHeader')}>
                      <strong>
                        {exercisePosition + 1}. {draft.exerciseName}
                      </strong>
                      <div className={cnPlannedWorkoutEditor('ExerciseActions')}>
                        <Button
                          aria-label={`Переместить ${draft.exerciseName} выше`}
                          disabled={exercisePosition === 0}
                          onClick={handleExerciseAction}
                          data-action='up'
                          data-exercise-position={exercisePosition}
                        >
                          ↑
                        </Button>
                        <Button
                          aria-label={`Переместить ${draft.exerciseName} ниже`}
                          disabled={exercisePosition === state.drafts.length - 1}
                          onClick={handleExerciseAction}
                          data-action='down'
                          data-exercise-position={exercisePosition}
                        >
                          ↓
                        </Button>
                        <Button
                          aria-label={`Удалить ${draft.exerciseName}`}
                          color='secondary'
                          onClick={handleExerciseAction}
                          data-action='remove'
                          data-exercise-position={exercisePosition}
                        >
                          Удалить
                        </Button>
                      </div>
                    </div>

                    <div className={cnPlannedWorkoutEditor('SetList')}>
                      {draft.sets.map((set, setPosition) => (
                        <div className={cnPlannedWorkoutEditor('SetRow')} key={setPosition}>
                          <span className={cnPlannedWorkoutEditor('SetLabel')}>{setPosition + 1}</span>
                          <Input
                            className={cnPlannedWorkoutEditor('SetInput')}
                            data-exercise-position={exercisePosition}
                            data-field='reps'
                            data-set-position={setPosition}
                            onChange={handleSetChange}
                            step='1'
                            type='number'
                            value={set.reps}
                          />
                          <span className={cnPlannedWorkoutEditor('SetUnit')}>повт.</span>
                          <Input
                            className={cnPlannedWorkoutEditor('SetInput')}
                            data-exercise-position={exercisePosition}
                            data-field='weightKg'
                            data-set-position={setPosition}
                            onChange={handleSetChange}
                            step='0.1'
                            type='number'
                            value={set.weightKg}
                          />
                          <span className={cnPlannedWorkoutEditor('SetUnit')}>кг</span>
                          <Button
                            aria-label={`Удалить подход ${setPosition + 1}`}
                            className={cnPlannedWorkoutEditor('RemoveSet')}
                            onClick={handleSetAction}
                            data-action='remove'
                            data-exercise-position={exercisePosition}
                            data-set-position={setPosition}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      className={cnPlannedWorkoutEditor('AddSet')}
                      onClick={handleSetAction}
                      data-action='add'
                      data-exercise-position={exercisePosition}
                    >
                      + Подход
                    </Button>
                  </article>
                ))}
              </div>
            </section>

            {state.formError !== undefined && (
              <p className={cnPlannedWorkoutEditor('FormError')} role='alert'>
                {state.formError}
              </p>
            )}
          </form>
        )}
      </main>
    </div>
  );
});
