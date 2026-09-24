import { type ChangeEvent, type FC, type SyntheticEvent, useCallback, useEffect, useRef } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ApiError } from '../../services/api/api.models';
import type { Client } from '../../services/clients/clients.models';
import { deleteClient, getClientById, updateClient } from '../../services/clients/clients.service';
import type { PlannedWorkout } from '../../services/plans/plans.models';
import { listPlans } from '../../services/plans/plans.service';
import type { WorkoutSession } from '../../services/workoutSessions/workoutSessions.models';
import {
  createWorkoutSession,
  getActiveWorkoutSession,
  getLatestCompletedWorkoutSession
} from '../../services/workoutSessions/workoutSessions.service';
import { Button } from '../Button/Button';
import { ClientCreateForm } from '../ClientCreateForm/ClientCreateForm';
import { DialogActions } from '../Dialog/Actions/Dialog-Actions';
import { DialogContent } from '../Dialog/Content/Dialog-Content';
import { Dialog } from '../Dialog/Dialog';
import { DialogTitle } from '../Dialog/Title/Dialog-Title';
import { Loading } from '../Loading/Loading';

import './ClientHub.scss';

const cnClientHub = cn('ClientHub');
const sessionTimestampFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

type ClientHubProps = {
  readonly initialClient?: Client;
};

type ClientHubState = {
  client?: Client;
  plans: readonly PlannedWorkout[];
  plansLoading: boolean;
  plansError?: string;
  activeSession: WorkoutSession | null;
  latestCompletedSession: WorkoutSession | null;
  sessionsLoading: boolean;
  sessionsError?: string;
  startDialogOpen: boolean;
  selectedPlanId: string;
  starting: boolean;
  startingError?: string;
  loading: boolean;
  error?: string;
  notesExpanded: boolean;
  editOpen: boolean;
  editName: string;
  editNotes: string;
  editBodyWeightKg: string;
  submitting: boolean;
  mutationError?: string;
  openEdit(): void;
  closeEdit(): void;
  setEditName(value: string): void;
  setEditNotes(value: string): void;
  setEditBodyWeightKg(value: string): void;
  setSubmitting(value: boolean): void;
  setMutationError(value: string | undefined): void;
  setClient(value: Client | undefined): void;
  setPlans(value: readonly PlannedWorkout[]): void;
  setPlansLoading(value: boolean): void;
  setPlansError(value: string | undefined): void;
  setActiveSession(value: WorkoutSession | null): void;
  setLatestCompletedSession(value: WorkoutSession | null): void;
  setSessionsLoading(value: boolean): void;
  setSessionsError(value: string | undefined): void;
  openStartDialog(): void;
  closeStartDialog(): void;
  setSelectedPlanId(value: string): void;
  setStarting(value: boolean): void;
  setStartingError(value: string | undefined): void;
  setLoading(value: boolean): void;
  setError(value: string | undefined): void;
  toggleNotesExpanded(): void;
};

function formatBodyWeightKg(bodyWeightKg: number | undefined): string {
  if (bodyWeightKg === undefined) {
    return '—';
  }

  return `${bodyWeightKg} кг`;
}

function formatPlannedDate(value: string): string {
  const [year, month, day] = value.split('-');
  return `${day}.${month}.${year}`;
}

function formatSessionTimestamp(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : sessionTimestampFormatter.format(date);
}

function getStartWorkoutErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Не удалось начать тренировку';
  }

  if (error.status === 404) {
    return 'План тренировки не найден';
  }

  if (error.status === 409) {
    return 'У клиента уже есть тренировка в процессе';
  }

  if (typeof error.body === 'object' && error.body !== null) {
    const bodyError: unknown = Reflect.get(error.body, 'error');
    if (typeof bodyError === 'string' && bodyError.length > 0) {
      return bodyError;
    }
  }

  return `Не удалось начать тренировку (HTTP ${error.status})`;
}

function formatWorkoutCount(value: number, singular: string, paucal: string, plural: string): string {
  const lastTwoDigits = value % 100;
  const lastDigit = value % 10;
  let noun = plural;
  if (lastDigit === 1 && (lastTwoDigits < 11 || lastTwoDigits > 14)) {
    noun = singular;
  } else if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) {
    noun = paucal;
  }
  return `${value} ${noun}`;
}

function truncateNotes(notes: string, maxLength: number): string {
  if (notes.length <= maxLength) {
    return notes;
  }

  return `${notes.slice(0, maxLength).trimEnd()}…`;
}

export const ClientHub: FC<ClientHubProps> = observer(({ initialClient }) => {
  const staticMode = initialClient !== undefined;
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const state = useLocalObservable<ClientHubState>(() => ({
    client: initialClient,
    plans: [],
    plansLoading: !staticMode,
    activeSession: null,
    latestCompletedSession: null,
    sessionsLoading: !staticMode,
    startDialogOpen: false,
    selectedPlanId: '',
    starting: false,
    startingError: undefined,
    loading: !staticMode,
    notesExpanded: false,
    editOpen: false,
    editName: '',
    editNotes: '',
    editBodyWeightKg: '',
    submitting: false,
    mutationError: undefined,
    openEdit() {
      if (this.client === undefined) {
        return;
      }
      this.editName = this.client.name;
      this.editNotes = this.client.notes ?? '';
      this.editBodyWeightKg = this.client.bodyWeightKg?.toString() ?? '';
      this.mutationError = undefined;
      this.editOpen = true;
    },
    closeEdit() {
      if (!this.submitting) {
        this.editOpen = false;
      }
    },
    setEditName(value) {
      this.editName = value;
    },
    setEditNotes(value) {
      this.editNotes = value;
    },
    setEditBodyWeightKg(value) {
      this.editBodyWeightKg = value;
    },
    setSubmitting(value) {
      this.submitting = value;
    },
    setMutationError(value) {
      this.mutationError = value;
    },
    setClient(value) {
      this.client = value;
    },
    setPlans(value) {
      this.plans = value;
    },
    setPlansLoading(value) {
      this.plansLoading = value;
    },
    setPlansError(value) {
      this.plansError = value;
    },
    setActiveSession(value) {
      this.activeSession = value ?? null;
    },
    setLatestCompletedSession(value) {
      this.latestCompletedSession = value ?? null;
    },
    setSessionsLoading(value) {
      this.sessionsLoading = value;
    },
    setSessionsError(value) {
      this.sessionsError = value;
    },
    openStartDialog() {
      this.selectedPlanId = this.plans[0]?.id ?? '';
      this.startingError = undefined;
      this.startDialogOpen = true;
    },
    closeStartDialog() {
      if (!this.starting) {
        this.startDialogOpen = false;
      }
    },
    setSelectedPlanId(value) {
      this.selectedPlanId = value;
    },
    setStarting(value) {
      this.starting = value;
    },
    setStartingError(value) {
      this.startingError = value;
    },
    setLoading(value) {
      this.loading = value;
    },
    setError(value) {
      this.error = value;
    },
    toggleNotesExpanded() {
      this.notesExpanded = !this.notesExpanded;
    }
  }));

  const loadClient = useCallback(async () => {
    if (id === undefined || id.length === 0) {
      state.setError('Клиент не найден');
      state.setLoading(false);
      return;
    }

    state.setLoading(true);
    state.setError(undefined);

    try {
      const loadedClient = await getClientById(id);
      state.setClient(loadedClient);
    } catch {
      state.setError('Не удалось загрузить клиента');
      state.setClient(undefined);
    } finally {
      state.setLoading(false);
    }
  }, [id, state]);

  const loadPlans = useCallback(async () => {
    if (staticMode || id === undefined || id.length === 0) {
      state.setPlansLoading(false);
      return;
    }

    state.setPlansLoading(true);
    state.setPlansError(undefined);
    try {
      state.setPlans(await listPlans(id));
    } catch {
      state.setPlansError('Не удалось загрузить планы');
    } finally {
      state.setPlansLoading(false);
    }
  }, [id, state, staticMode]);

  const loadSessions = useCallback(async () => {
    if (staticMode || id === undefined || id.length === 0) {
      state.setSessionsLoading(false);
      return;
    }

    state.setSessionsLoading(true);
    state.setSessionsError(undefined);
    try {
      const [activeSession, latestCompletedSession] = await Promise.all([
        getActiveWorkoutSession(id),
        getLatestCompletedWorkoutSession(id)
      ]);
      state.setActiveSession(activeSession);
      state.setLatestCompletedSession(latestCompletedSession);
    } catch {
      state.setSessionsError('Не удалось загрузить тренировки');
    } finally {
      state.setSessionsLoading(false);
    }
  }, [id, state, staticMode]);

  useEffect(() => {
    if (!staticMode) {
      void loadClient();
      void loadPlans();
      void loadSessions();
    }
  }, [loadClient, loadPlans, loadSessions, staticMode]);

  const handleRetry = useCallback(() => {
    void loadClient();
  }, [loadClient]);

  const handlePlansRetry = useCallback(() => {
    void loadPlans();
  }, [loadPlans]);

  const handleSessionsRetry = useCallback(() => {
    void loadSessions();
  }, [loadSessions]);

  const handleStartOpen = useCallback(() => {
    state.openStartDialog();
  }, [state]);

  const handleStartCancel = useCallback(() => {
    state.closeStartDialog();
  }, [state]);

  const handlePlanChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      state.setSelectedPlanId(event.currentTarget.value);
    },
    [state]
  );

  const handleStart = useCallback(async () => {
    if (id === undefined || state.starting || state.activeSession !== null) {
      return;
    }

    const selectedPlan = state.plans.find(plan => plan.id === state.selectedPlanId);
    if (selectedPlan === undefined) {
      state.setStartingError('Выберите план тренировки');
      return;
    }

    if (staticMode) {
      state.setStartingError('Запуск недоступен в демонстрационном режиме');
      return;
    }

    state.setStartingError(undefined);
    state.setStarting(true);
    try {
      const session = await createWorkoutSession(id, { plannedWorkoutId: selectedPlan.id });
      state.setActiveSession(session);
      await navigate(`/workouts/${session.clientId}/${session.id}`);
    } catch (error) {
      state.setStartingError(getStartWorkoutErrorMessage(error));
    } finally {
      state.setStarting(false);
    }
  }, [id, navigate, state, staticMode]);

  const handleAllPlans = useCallback(() => {
    if (id !== undefined) {
      void navigate(`/clients/${id}/plans`);
    }
  }, [id, navigate]);

  const deleteDialogRef = useRef<HTMLDialogElement>(null);

  const handleEdit = useCallback(() => {
    state.openEdit();
  }, [state]);

  const handleSave = useCallback(
    async (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (state.submitting || state.client === undefined) {
        return;
      }
      state.setMutationError(undefined);
      const name = state.editName.trim();
      const weight = state.editBodyWeightKg.trim();
      const bodyWeightKg = weight.length === 0 ? null : Number(weight);
      if (name.length === 0) {
        state.setMutationError('Укажите имя клиента');
        return;
      }
      if (bodyWeightKg !== null && (!Number.isFinite(bodyWeightKg) || bodyWeightKg <= 0)) {
        state.setMutationError('Вес должен быть положительным числом');
        return;
      }
      if (staticMode) {
        state.setMutationError('Сохранение недоступно в демонстрационном режиме');
        return;
      }
      state.setSubmitting(true);
      try {
        const updated = await updateClient(state.client.id, { name, notes: state.editNotes.trim(), bodyWeightKg });
        state.setClient(updated);
        state.setSubmitting(false);
        state.closeEdit();
      } catch {
        state.setMutationError('Не удалось сохранить клиента');
      } finally {
        state.setSubmitting(false);
      }
    },
    [state, staticMode]
  );

  const handleDeleteOpen = useCallback(() => {
    state.setMutationError(undefined);
    deleteDialogRef.current?.showModal();
  }, [state]);

  const handleDeleteCancel = useCallback(() => {
    if (!state.submitting) {
      deleteDialogRef.current?.close();
    }
  }, [state]);

  const handleDeleteEscape = useCallback(
    (event: SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      handleDeleteCancel();
    },
    [handleDeleteCancel]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (state.submitting || state.client === undefined) {
      return;
    }
    state.setMutationError(undefined);
    if (staticMode) {
      state.setMutationError('Удаление недоступно в демонстрационном режиме');
      return;
    }
    state.setSubmitting(true);
    try {
      await deleteClient(state.client.id);
      deleteDialogRef.current?.close();
      void navigate('/clients', { replace: true });
    } catch {
      state.setMutationError('Не удалось удалить клиента');
    } finally {
      state.setSubmitting(false);
    }
  }, [navigate, state, staticMode]);

  const notes = state.client?.notes?.trim() ?? '';
  const nearestPlan = state.plans[0];
  const hasNotes = notes.length > 0;
  const notesPreview = hasNotes ? truncateNotes(notes, 60) : 'Нет заметок';

  return (
    <div className={cnClientHub()}>
      <main className={cnClientHub('Main')}>
        <header className={cnClientHub('Header')}>
          <Link aria-label='Назад к списку клиентов' className={cnClientHub('Back')} to='/clients'>
            ←
          </Link>
          <h1 className={cnClientHub('Title')}>{state.client?.name ?? 'Клиент'}</h1>
          <Button
            className={cnClientHub('Edit')}
            disabled={state.client === undefined}
            onClick={handleEdit}
            type='button'
          >
            Править
          </Button>
        </header>

        <div className={cnClientHub('Content')}>
          {state.loading && <Loading className={cnClientHub('Loading')} visible />}

          {state.error !== undefined && (
            <div className={cnClientHub('ErrorBlock')}>
              <p className={cnClientHub('Error')}>{state.error}</p>
              <Button className={cnClientHub('Retry')} color='secondary' onClick={handleRetry} type='button'>
                Повторить
              </Button>
            </div>
          )}

          {!state.loading && state.error === undefined && state.client !== undefined && (
            <>
              <section className={cnClientHub('Section', { type: 'notes' })}>
                <button
                  aria-expanded={state.notesExpanded}
                  className={cnClientHub('NotesToggle')}
                  onClick={state.toggleNotesExpanded}
                  type='button'
                >
                  <span className={cnClientHub('SectionLabel')}>Заметки</span>
                  <span className={cnClientHub('NotesPreview')}>
                    {state.notesExpanded && hasNotes ? notes : notesPreview}
                  </span>
                </button>
              </section>

              <section className={cnClientHub('Section', { type: 'bodyWeight' })}>
                <div className={cnClientHub('Row')}>
                  <span className={cnClientHub('SectionLabel')}>Вес тела</span>
                  <span className={cnClientHub('BodyWeight')}>{formatBodyWeightKg(state.client.bodyWeightKg)}</span>
                </div>
              </section>

              {(state.sessionsLoading || state.activeSession !== null) && (
                <section className={cnClientHub('Section', { type: 'activeWorkout' })}>
                  <h2 className={cnClientHub('SectionTitle')}>Тренировка в процессе</h2>
                  {state.sessionsLoading && <Loading className={cnClientHub('SessionsLoading')} visible />}
                  {state.activeSession !== null && (
                    <div className={cnClientHub('ActiveWorkout')}>
                      <div className={cnClientHub('ActiveWorkoutInfo')}>
                        <span className={cnClientHub('ActiveWorkoutTag')}>{state.activeSession.splitTag}</span>
                        <span className={cnClientHub('ActiveWorkoutTime')}>
                          с {formatSessionTimestamp(state.activeSession.startedAt)}
                        </span>
                      </div>
                      <Button asChild className={cnClientHub('OpenWorkout')} color='primary'>
                        <Link to={`/workouts/${state.activeSession.clientId}/${state.activeSession.id}`}>Открыть</Link>
                      </Button>
                    </div>
                  )}
                </section>
              )}

              <section className={cnClientHub('Section', { type: 'plan' })}>
                <h2 className={cnClientHub('SectionTitle')}>Ближайший план</h2>
                {state.plansLoading && <Loading className={cnClientHub('PlansLoading')} visible />}
                {state.plansError !== undefined && (
                  <div className={cnClientHub('PlansError')}>
                    <p>{state.plansError}</p>
                    <Button color='secondary' onClick={handlePlansRetry} type='button'>
                      Повторить
                    </Button>
                  </div>
                )}
                {!state.plansLoading && state.plansError === undefined && state.plans.length === 0 && (
                  <p className={cnClientHub('StubText')}>Нет предстоящих планов</p>
                )}
                {!state.plansLoading && state.plansError === undefined && nearestPlan !== undefined && (
                  <div className={cnClientHub('PlanRow')}>
                    <span>
                      {formatPlannedDate(nearestPlan.plannedDate)} · {nearestPlan.splitTag}
                    </span>
                    {state.plans.length > 1 && (
                      <span className={cnClientHub('PlanCount')}>+ ещё {state.plans.length - 1}</span>
                    )}
                  </div>
                )}
                <Button
                  className={cnClientHub('StubAction')}
                  disabled={id === undefined}
                  onClick={handleAllPlans}
                  type='button'
                >
                  Все планы
                </Button>
              </section>

              <section className={cnClientHub('Section', { type: 'actions' })}>
                <h2 className={cnClientHub('SectionTitle')}>Действия</h2>
                {state.activeSession !== null && (
                  <p className={cnClientHub('ActionHint')}>У клиента уже есть тренировка в процессе</p>
                )}
                <div className={cnClientHub('ActionRow')}>
                  <Button
                    className={cnClientHub('ActionButton')}
                    disabled={
                      id === undefined ||
                      staticMode ||
                      state.activeSession !== null ||
                      state.sessionsLoading ||
                      state.sessionsError !== undefined ||
                      state.plansLoading ||
                      state.plansError !== undefined ||
                      state.plans.length === 0
                    }
                    onClick={handleStartOpen}
                    type='button'
                  >
                    Старт с плана ▼
                  </Button>
                </div>
              </section>

              <section className={cnClientHub('Section', { type: 'latestWorkout' })}>
                <h2 className={cnClientHub('SectionTitle')}>Последняя тренировка</h2>
                {state.sessionsLoading && <Loading className={cnClientHub('SessionsLoading')} visible />}
                {state.sessionsError !== undefined && (
                  <div className={cnClientHub('SessionsError')}>
                    <p>{state.sessionsError}</p>
                    <Button color='secondary' onClick={handleSessionsRetry} type='button'>
                      Повторить
                    </Button>
                  </div>
                )}
                {!state.sessionsLoading &&
                  state.sessionsError === undefined &&
                  state.latestCompletedSession === null && (
                    <p className={cnClientHub('StubText')}>Завершённых тренировок пока нет</p>
                  )}
                {state.latestCompletedSession !== null && (
                  <div className={cnClientHub('LatestWorkout')}>
                    <span className={cnClientHub('LatestWorkoutDate')}>
                      {formatSessionTimestamp(
                        state.latestCompletedSession.completedAt ?? state.latestCompletedSession.startedAt
                      )}
                    </span>
                    <span className={cnClientHub('LatestWorkoutTag')}>{state.latestCompletedSession.splitTag}</span>
                    <span className={cnClientHub('LatestWorkoutStats')}>
                      {formatWorkoutCount(
                        state.latestCompletedSession.exercises.length,
                        'упражнение',
                        'упражнения',
                        'упражнений'
                      )}{' '}
                      ·{' '}
                      {formatWorkoutCount(
                        state.latestCompletedSession.exercises.reduce(
                          (total, exercise) => total + exercise.sets.length,
                          0
                        ),
                        'подход',
                        'подхода',
                        'подходов'
                      )}
                    </span>
                    <Link
                      className={cnClientHub('LatestWorkoutLink')}
                      to={`/workouts/${state.latestCompletedSession.clientId}/${state.latestCompletedSession.id}`}
                    >
                      Открыть результат
                    </Link>
                  </div>
                )}
              </section>

              <section className={cnClientHub('Section', { type: 'split' })}>
                <h2 className={cnClientHub('SectionTitle')}>Сплит</h2>
                <p className={cnClientHub('SoonHint')}>Скоро</p>
                <div className={cnClientHub('SplitRow')}>
                  <span className={cnClientHub('SplitTags')}>ноги · верх · день А</span>
                  <div className={cnClientHub('SplitActions')}>
                    <Button className={cnClientHub('SplitButton')} disabled type='button'>
                      + тег
                    </Button>
                    <Button aria-label='Настройки сплита' className={cnClientHub('SplitButton')} disabled type='button'>
                      ⚙
                    </Button>
                  </div>
                </div>
              </section>
            </>
          )}
          {!state.loading && state.client !== undefined && (
            <Button className={cnClientHub('Delete')} onClick={handleDeleteOpen} type='button'>
              Удалить клиента
            </Button>
          )}
        </div>
      </main>
      {state.editOpen && (
        <ClientCreateForm
          bodyWeightKg={state.editBodyWeightKg}
          error={state.mutationError}
          mode='edit'
          name={state.editName}
          notes={state.editNotes}
          onBodyWeightKgChange={state.setEditBodyWeightKg}
          onCancel={state.closeEdit}
          onNameChange={state.setEditName}
          onNotesChange={state.setEditNotes}
          onSubmit={handleSave}
          submitting={state.submitting}
        />
      )}
      {state.startDialogOpen && (
        <Dialog ariaLabel='Выбор плана тренировки' className={cnClientHub('StartDialog')} onCancel={handleStartCancel}>
          <DialogTitle>Начать тренировку с плана</DialogTitle>
          <DialogContent>
            {state.startingError !== undefined && (
              <p className={cnClientHub('StartError')} role='alert'>
                {state.startingError}
              </p>
            )}
            <div className={cnClientHub('PlanOptions')}>
              {state.plans.map(plan => (
                <label
                  className={cnClientHub('PlanOption', { selected: plan.id === state.selectedPlanId })}
                  key={plan.id}
                >
                  <input
                    checked={plan.id === state.selectedPlanId}
                    disabled={state.starting}
                    name='planned-workout'
                    onChange={handlePlanChange}
                    type='radio'
                    value={plan.id}
                  />
                  <span className={cnClientHub('PlanOptionText')}>
                    <strong>
                      {formatPlannedDate(plan.plannedDate)} · {plan.splitTag}
                    </strong>
                    <span>{formatWorkoutCount(plan.exercises.length, 'упражнение', 'упражнения', 'упражнений')}</span>
                  </span>
                </label>
              ))}
            </div>
          </DialogContent>
          <DialogActions>
            <Button disabled={state.starting} onClick={handleStartCancel} type='button'>
              Отмена
            </Button>
            <Button
              color='primary'
              disabled={state.starting || state.selectedPlanId.length === 0}
              onClick={handleStart}
              type='button'
            >
              {state.starting ? 'Запуск…' : 'Начать тренировку'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <dialog
        aria-describedby='client-delete-description'
        aria-labelledby='client-delete-title'
        className={cnClientHub('DeleteDialog')}
        onCancel={handleDeleteEscape}
        ref={deleteDialogRef}
      >
        <h2 id='client-delete-title'>Удалить клиента?</h2>
        <p id='client-delete-description'>Клиент «{state.client?.name}» будет удалён. Это действие нельзя отменить.</p>
        {state.mutationError !== undefined && (
          <p className={cnClientHub('DeleteError')} role='alert'>
            {state.mutationError}
          </p>
        )}
        <div className={cnClientHub('ActionRow')}>
          <Button
            className={cnClientHub('DeleteCancel')}
            disabled={state.submitting}
            onClick={handleDeleteCancel}
            type='button'
          >
            Отмена
          </Button>
          <Button
            className={cnClientHub('DeleteConfirm')}
            disabled={state.submitting}
            onClick={handleDeleteConfirm}
            type='button'
          >
            {state.submitting ? 'Удаление…' : 'Удалить'}
          </Button>
        </div>
      </dialog>
    </div>
  );
});
