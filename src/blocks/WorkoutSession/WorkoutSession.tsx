import { type ChangeEvent, type FC, type SyntheticEvent, useCallback, useEffect } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';
import { Link, useNavigate, useParams } from 'react-router-dom';

import type { Client } from '../../services/clients/clients.models';
import { getClientById } from '../../services/clients/clients.service';
import type { Exercise } from '../../services/exercises/exercises.models';
import { listExercises } from '../../services/exercises/exercises.service';
import type {
  UpdateWorkoutSessionRequest,
  WorkoutSession as WorkoutSessionModel
} from '../../services/workoutSessions/workoutSessions.models';
import {
  completeWorkoutSession,
  getWorkoutSession,
  updateWorkoutSession
} from '../../services/workoutSessions/workoutSessions.service';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Loading } from '../Loading/Loading';

import './WorkoutSession.scss';

const cnWorkoutSession = cn('WorkoutSession');

type DraftSet = {
  readonly reps: string;
  readonly weightKg: string;
};

type DraftExercise = {
  readonly exerciseId: string;
  readonly exerciseName: string;
  readonly sets: DraftSet[];
};

type WorkoutSessionState = {
  client?: Client;
  session?: WorkoutSessionModel;
  exercises: readonly Exercise[];
  drafts: DraftExercise[];
  selectedExerciseId: string;
  loading: boolean;
  error?: string;
  formError?: string;
  saveSuccess: boolean;
  saving: boolean;
  completing: boolean;
  setClient(value: Client): void;
  setSession(value: WorkoutSessionModel): void;
  setExercises(value: readonly Exercise[]): void;
  setSelectedExerciseId(value: string): void;
  setLoading(value: boolean): void;
  setError(value: string | undefined): void;
  setFormError(value: string | undefined): void;
  setSaveSuccess(value: boolean): void;
  setSaving(value: boolean): void;
  setCompleting(value: boolean): void;
  addExercise(exerciseId: string, exerciseName: string): void;
  removeExercise(position: number): void;
  moveExercise(from: number, to: number): void;
  addSet(exercisePosition: number): void;
  removeSet(exercisePosition: number, setPosition: number): void;
  setSetValue(exercisePosition: number, setPosition: number, field: keyof DraftSet, value: string): void;
};

type ValidationResult =
  | { readonly ok: true; readonly payload: UpdateWorkoutSessionRequest }
  | { readonly ok: false; readonly error: string };

const timestampFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

function formatTimestamp(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : timestampFormatter.format(date);
}

function toDraftExercises(session: WorkoutSessionModel): DraftExercise[] {
  return session.exercises.map(exercise => ({
    exerciseId: exercise.exerciseId,
    exerciseName: exercise.exerciseName,
    sets: exercise.sets.map(set => ({ reps: `${set.reps}`, weightKg: `${set.weightKg}` }))
  }));
}

function buildPayload(drafts: readonly DraftExercise[]): ValidationResult {
  const exercises: UpdateWorkoutSessionRequest['exercises'][number][] = [];
  for (const draft of drafts) {
    const sets: UpdateWorkoutSessionRequest['exercises'][number]['sets'][number][] = [];
    for (const set of draft.sets) {
      const repsValue = set.reps.trim();
      const weightValue = set.weightKg.trim();
      const reps = Number(repsValue);
      const weightKg = Number(weightValue);

      if (repsValue.length === 0 || !Number.isInteger(reps) || reps <= 0) {
        return { ok: false, error: `Повторы для «${draft.exerciseName}» должны быть положительным целым числом` };
      }
      if (weightValue.length === 0 || !Number.isFinite(weightKg) || weightKg < 0) {
        return { ok: false, error: `Вес для «${draft.exerciseName}» должен быть неотрицательным числом` };
      }

      sets.push({ reps, weightKg });
    }
    exercises.push({ exerciseId: draft.exerciseId, sets });
  }

  return { ok: true, payload: { exercises } };
}

type ExerciseAction = 'up' | 'down' | 'remove';

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

type SetAction = 'add' | 'remove';

type WorkoutSessionSetActionProps = {
  readonly action: SetAction;
  readonly className?: string;
  readonly disabled: boolean;
  readonly exercisePosition: number;
  readonly setPosition?: number;
  onAction(action: SetAction, exercisePosition: number, setPosition: number | undefined): void;
};

const WorkoutSessionSetAction: FC<WorkoutSessionSetActionProps> = ({
  action,
  className,
  disabled,
  exercisePosition,
  setPosition,
  onAction
}) => {
  const handleClick = useCallback(() => {
    onAction(action, exercisePosition, setPosition);
  }, [action, exercisePosition, onAction, setPosition]);

  const ariaLabel =
    action === 'add'
      ? `Добавить подход в упражнение ${exercisePosition + 1}`
      : `Удалить подход ${(setPosition ?? 0) + 1} у упражнения ${exercisePosition + 1}`;

  return (
    <Button aria-label={ariaLabel} className={className} disabled={disabled} onClick={handleClick}>
      {action === 'add' ? '+ Подход' : '×'}
    </Button>
  );
};

type WorkoutSessionSetInputProps = {
  readonly disabled: boolean;
  readonly exercisePosition: number;
  readonly field: 'reps' | 'weightKg';
  readonly setPosition: number;
  readonly value: string;
  onChange(exercisePosition: number, setPosition: number, field: 'reps' | 'weightKg', value: string): void;
};

const WorkoutSessionSetInput: FC<WorkoutSessionSetInputProps> = ({
  disabled,
  exercisePosition,
  field,
  setPosition,
  value,
  onChange
}) => {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(exercisePosition, setPosition, field, event.target.value);
    },
    [exercisePosition, field, onChange, setPosition]
  );

  return (
    <Input
      className={cnWorkoutSession('SetInput')}
      disabled={disabled}
      onChange={handleChange}
      step={field === 'reps' ? '1' : '0.1'}
      type='number'
      value={value}
    />
  );
};

export const WorkoutSession: FC = observer(() => {
  const navigate = useNavigate();
  const { clientId, sessionId } = useParams<{ clientId: string; sessionId: string }>();
  const state = useLocalObservable<WorkoutSessionState>(() => ({
    exercises: [],
    drafts: [],
    selectedExerciseId: '',
    loading: true,
    saveSuccess: false,
    saving: false,
    completing: false,
    setClient(value) {
      this.client = value;
    },
    setSession(value) {
      this.session = value;
      this.drafts = toDraftExercises(value);
    },
    setExercises(value) {
      this.exercises = value;
    },
    setSelectedExerciseId(value) {
      this.selectedExerciseId = value;
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
    setSaveSuccess(value) {
      this.saveSuccess = value;
    },
    setSaving(value) {
      this.saving = value;
    },
    setCompleting(value) {
      this.completing = value;
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
      this.formError = undefined;
      this.saveSuccess = false;
    },
    removeExercise(position) {
      this.drafts = this.drafts.filter((_, index) => index !== position);
      this.formError = undefined;
      this.saveSuccess = false;
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
        this.formError = undefined;
        this.saveSuccess = false;
      }
    },
    addSet(exercisePosition) {
      this.drafts = this.drafts.map((draft, index) =>
        index === exercisePosition ? { ...draft, sets: [...draft.sets, { reps: '', weightKg: '' }] } : draft
      );
      this.formError = undefined;
      this.saveSuccess = false;
    },
    removeSet(exercisePosition, setPosition) {
      this.drafts = this.drafts.map((draft, index) => {
        if (index !== exercisePosition) {
          return draft;
        }

        const sets: DraftSet[] = [];
        for (let currentSetPosition = 0; currentSetPosition < draft.sets.length; currentSetPosition += 1) {
          const set = draft.sets[currentSetPosition];
          if (set !== undefined && currentSetPosition !== setPosition) {
            sets.push(set);
          }
        }
        return { ...draft, sets };
      });
      this.formError = undefined;
      this.saveSuccess = false;
    },
    setSetValue(exercisePosition, setPosition, field, value) {
      this.drafts = this.drafts.map((draft, index) => {
        if (index !== exercisePosition) {
          return draft;
        }

        const sets: DraftSet[] = [];
        for (let currentSetPosition = 0; currentSetPosition < draft.sets.length; currentSetPosition += 1) {
          const set = draft.sets[currentSetPosition];
          if (set === undefined) {
            continue;
          }
          sets.push(currentSetPosition === setPosition ? { ...set, [field]: value } : set);
        }
        return { ...draft, sets };
      });
      this.formError = undefined;
      this.saveSuccess = false;
    }
  }));

  const loadWorkout = useCallback(async () => {
    if (clientId === undefined || clientId.length === 0 || sessionId === undefined || sessionId.length === 0) {
      state.setError('Тренировка не найдена');
      state.setLoading(false);
      return;
    }

    state.setLoading(true);
    state.setError(undefined);
    state.setFormError(undefined);
    state.setSaveSuccess(false);
    try {
      const [session, exercises, client] = await Promise.all([
        getWorkoutSession(clientId, sessionId),
        listExercises(),
        getClientById(clientId)
      ]);
      state.setSession(session);
      state.setExercises(exercises);
      state.setSelectedExerciseId(exercises[0]?.id ?? '');
      state.setClient(client);
    } catch {
      state.setError('Не удалось загрузить тренировку');
    } finally {
      state.setLoading(false);
    }
  }, [clientId, sessionId, state]);

  useEffect(() => {
    void loadWorkout();
  }, [loadWorkout]);

  const handleRetry = useCallback(() => {
    void loadWorkout();
  }, [loadWorkout]);

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

    state.addExercise(selected.id, selected.name);
  }, [state]);

  const handleExerciseAction = useCallback(
    (action: ExerciseAction, exercisePosition: number) => {
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
    (action: SetAction, exercisePosition: number, setPosition: number | undefined) => {
      if (action === 'add') {
        state.addSet(exercisePosition);
      }
      if (action === 'remove' && setPosition !== undefined) {
        state.removeSet(exercisePosition, setPosition);
      }
    },
    [state]
  );

  const handleSetChange = useCallback(
    (exercisePosition: number, setPosition: number, field: 'reps' | 'weightKg', value: string) => {
      state.setSetValue(exercisePosition, setPosition, field, value);
    },
    [state]
  );

  const saveFacts = useCallback(async (): Promise<boolean> => {
    if (clientId === undefined || sessionId === undefined || state.session?.status !== 'in_progress') {
      return false;
    }

    const validation = buildPayload(state.drafts);
    if (!validation.ok) {
      state.setFormError(validation.error);
      return false;
    }

    state.setFormError(undefined);
    state.setSaveSuccess(false);
    try {
      const updated = await updateWorkoutSession(clientId, sessionId, validation.payload);
      state.setSession(updated);
      state.setSaveSuccess(true);
      return true;
    } catch {
      state.setFormError('Не удалось сохранить факт тренировки');
      return false;
    }
  }, [clientId, sessionId, state]);

  const handleSave = useCallback(
    async (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (state.saving || state.completing) {
        return;
      }

      state.setSaving(true);
      try {
        await saveFacts();
      } finally {
        state.setSaving(false);
      }
    },
    [saveFacts, state]
  );

  const handleComplete = useCallback(async () => {
    if (clientId === undefined || sessionId === undefined || state.saving || state.completing) {
      return;
    }

    state.setCompleting(true);
    try {
      const saved = await saveFacts();
      if (!saved) {
        return;
      }

      await completeWorkoutSession(clientId, sessionId);
      await navigate(`/clients/${clientId}`);
    } catch {
      state.setFormError('Не удалось завершить тренировку');
    } finally {
      state.setCompleting(false);
    }
  }, [clientId, navigate, saveFacts, sessionId, state]);

  const session = state.session;
  const client = state.client;
  const isInProgress = session?.status === 'in_progress';
  const mutationDisabled = state.saving || state.completing;

  return (
    <div className={cnWorkoutSession()}>
      <main className={cnWorkoutSession('Main')}>
        <header className={cnWorkoutSession('Header')}>
          <Link
            aria-label='Назад к карточке клиента'
            className={cnWorkoutSession('Back')}
            to={clientId === undefined ? '/clients' : `/clients/${clientId}`}
          >
            ←
          </Link>
          <h1 className={cnWorkoutSession('Title')}>Тренировка</h1>
        </header>

        {state.loading && <Loading className={cnWorkoutSession('Loading')} visible />}

        {state.error !== undefined && (
          <div className={cnWorkoutSession('ErrorBlock')}>
            <p className={cnWorkoutSession('Error')} role='alert'>
              {state.error}
            </p>
            <Button color='secondary' onClick={handleRetry} type='button'>
              Повторить
            </Button>
          </div>
        )}

        {!state.loading && state.error === undefined && session !== undefined && client !== undefined && (
          <>
            <section className={cnWorkoutSession('Meta')}>
              <div className={cnWorkoutSession('MetaRow')}>
                <span className={cnWorkoutSession('MetaLabel')}>Клиент</span>
                <span className={cnWorkoutSession('Client')}>{client.name}</span>
              </div>
              <div className={cnWorkoutSession('MetaRow')}>
                <span className={cnWorkoutSession('MetaLabel')}>Тег</span>
                <span className={cnWorkoutSession('Split')}>{session.splitTag}</span>
              </div>
              <div className={cnWorkoutSession('MetaRow')}>
                <span className={cnWorkoutSession('MetaLabel')}>Статус</span>
                <span className={cnWorkoutSession('Status', { completed: session.status === 'completed' })}>
                  {isInProgress ? 'В процессе' : 'Завершена'}
                </span>
              </div>
              <div className={cnWorkoutSession('MetaRow')}>
                <span className={cnWorkoutSession('MetaLabel')}>Начало</span>
                <span className={cnWorkoutSession('StartedAt')}>{formatTimestamp(session.startedAt)}</span>
              </div>
              {session.completedAt !== undefined && (
                <div className={cnWorkoutSession('MetaRow')}>
                  <span className={cnWorkoutSession('MetaLabel')}>Завершение</span>
                  <span className={cnWorkoutSession('CompletedAt')}>{formatTimestamp(session.completedAt)}</span>
                </div>
              )}
            </section>

            <form className={cnWorkoutSession('Form')} id='workout-session-form' onSubmit={handleSave}>
              <section className={cnWorkoutSession('ExercisesSection')}>
                <div className={cnWorkoutSession('ExercisesHeader')}>
                  <h2 className={cnWorkoutSession('SectionTitle')}>Фактические упражнения</h2>
                  {isInProgress && (
                    <div className={cnWorkoutSession('AddExercise')}>
                      <select
                        aria-label='Упражнение'
                        className={cnWorkoutSession('ExerciseSelect')}
                        disabled={state.exercises.length === 0 || mutationDisabled}
                        onChange={handleExerciseChange}
                        value={state.selectedExerciseId}
                      >
                        {state.exercises.map(exercise => (
                          <option key={exercise.id} value={exercise.id}>
                            {exercise.name}
                          </option>
                        ))}
                      </select>
                      <Button
                        disabled={state.exercises.length === 0 || mutationDisabled}
                        onClick={handleAddExercise}
                        type='button'
                      >
                        + Упражнение
                      </Button>
                    </div>
                  )}
                </div>

                {state.drafts.length === 0 && <p className={cnWorkoutSession('Empty')}>Упражнения не добавлены</p>}

                <div className={cnWorkoutSession('ExerciseList')}>
                  {state.drafts.map((draft, exercisePosition) => (
                    <article
                      className={cnWorkoutSession('ExerciseCard')}
                      key={`${draft.exerciseId}-${exercisePosition}`}
                    >
                      <div className={cnWorkoutSession('ExerciseHeader')}>
                        <strong>
                          {exercisePosition + 1}. {draft.exerciseName}
                        </strong>
                        {isInProgress && (
                          <div className={cnWorkoutSession('ExerciseActions')}>
                            <WorkoutSessionExerciseAction
                              action='up'
                              disabled={exercisePosition === 0 || mutationDisabled}
                              exerciseName={draft.exerciseName}
                              exercisePosition={exercisePosition}
                              onAction={handleExerciseAction}
                            />
                            <WorkoutSessionExerciseAction
                              action='down'
                              disabled={exercisePosition === state.drafts.length - 1 || mutationDisabled}
                              exerciseName={draft.exerciseName}
                              exercisePosition={exercisePosition}
                              onAction={handleExerciseAction}
                            />
                            <WorkoutSessionExerciseAction
                              action='remove'
                              disabled={mutationDisabled}
                              exerciseName={draft.exerciseName}
                              exercisePosition={exercisePosition}
                              onAction={handleExerciseAction}
                            />
                          </div>
                        )}
                      </div>

                      <div className={cnWorkoutSession('SetList')}>
                        {draft.sets.map((set, setPosition) => (
                          <div className={cnWorkoutSession('SetRow')} key={setPosition}>
                            <span className={cnWorkoutSession('SetLabel')}>{setPosition + 1}</span>
                            {isInProgress ? (
                              <>
                                <WorkoutSessionSetInput
                                  disabled={mutationDisabled}
                                  exercisePosition={exercisePosition}
                                  field='reps'
                                  setPosition={setPosition}
                                  value={set.reps}
                                  onChange={handleSetChange}
                                />
                                <span className={cnWorkoutSession('SetUnit')}>повт.</span>
                                <WorkoutSessionSetInput
                                  disabled={mutationDisabled}
                                  exercisePosition={exercisePosition}
                                  field='weightKg'
                                  setPosition={setPosition}
                                  value={set.weightKg}
                                  onChange={handleSetChange}
                                />
                                <span className={cnWorkoutSession('SetUnit')}>кг</span>
                                <WorkoutSessionSetAction
                                  action='remove'
                                  className={cnWorkoutSession('RemoveSet')}
                                  disabled={mutationDisabled}
                                  exercisePosition={exercisePosition}
                                  setPosition={setPosition}
                                  onAction={handleSetAction}
                                />
                              </>
                            ) : (
                              <>
                                <span className={cnWorkoutSession('SetValue')}>{set.reps} повт.</span>
                                <span className={cnWorkoutSession('SetValue')}>{set.weightKg} кг</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                      {isInProgress && (
                        <WorkoutSessionSetAction
                          action='add'
                          className={cnWorkoutSession('AddSet')}
                          disabled={mutationDisabled}
                          exercisePosition={exercisePosition}
                          onAction={handleSetAction}
                        />
                      )}
                    </article>
                  ))}
                </div>
              </section>

              {state.formError !== undefined && (
                <p className={cnWorkoutSession('FormError')} role='alert'>
                  {state.formError}
                </p>
              )}
              {state.saveSuccess && (
                <p className={cnWorkoutSession('Success')} role='status'>
                  Факт сохранён
                </p>
              )}

              {isInProgress && (
                <div className={cnWorkoutSession('Actions')}>
                  <Button
                    className={cnWorkoutSession('Save')}
                    color='secondary'
                    disabled={mutationDisabled}
                    form='workout-session-form'
                    type='submit'
                  >
                    {state.saving ? 'Сохранение…' : 'Сохранить факт'}
                  </Button>
                  <Button
                    className={cnWorkoutSession('Complete')}
                    color='primary'
                    disabled={mutationDisabled}
                    onClick={handleComplete}
                    type='button'
                  >
                    {state.completing ? 'Завершение…' : 'Завершить тренировку'}
                  </Button>
                </div>
              )}
            </form>
          </>
        )}
      </main>
    </div>
  );
});
