import { type FC, type SyntheticEvent, useCallback, useEffect, useRef } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';
import { useNavigate, useParams } from 'react-router-dom';

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
import { ClientCreateForm } from '../ClientCreateForm/ClientCreateForm';
import { ClientHubContent } from './Content/ClientHub-Content';
import { ClientHubDeleteDialog } from './DeleteDialog/ClientHub-DeleteDialog';
import { ClientHubHeader } from './Header/ClientHub-Header';
import { ClientHubMain } from './Main/ClientHub-Main';
import { ClientHubStartDialog } from './StartDialog/ClientHub-StartDialog';

import './ClientHub.scss';

const cnClientHub = cn('ClientHub');

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
    (value: string) => {
      state.setSelectedPlanId(value);
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

  const handleNotesToggle = useCallback(() => {
    state.toggleNotesExpanded();
  }, [state]);

  return (
    <div className={cnClientHub()}>
      <ClientHubMain>
        <ClientHubHeader client={state.client} onEdit={handleEdit} />
        <ClientHubContent
          activeSession={state.activeSession}
          client={state.client}
          error={state.error}
          id={id}
          latestCompletedSession={state.latestCompletedSession}
          loading={state.loading}
          notesExpanded={state.notesExpanded}
          plans={state.plans}
          plansError={state.plansError}
          plansLoading={state.plansLoading}
          sessionsError={state.sessionsError}
          sessionsLoading={state.sessionsLoading}
          staticMode={staticMode}
          onAllPlans={handleAllPlans}
          onDelete={handleDeleteOpen}
          onPlansRetry={handlePlansRetry}
          onRetry={handleRetry}
          onSessionsRetry={handleSessionsRetry}
          onStartOpen={handleStartOpen}
          onToggleNotes={handleNotesToggle}
        />
      </ClientHubMain>
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
        <ClientHubStartDialog
          error={state.startingError}
          plans={state.plans}
          selectedPlanId={state.selectedPlanId}
          starting={state.starting}
          onCancel={handleStartCancel}
          onPlanChange={handlePlanChange}
          onStart={handleStart}
        />
      )}
      <ClientHubDeleteDialog
        client={state.client}
        dialogRef={deleteDialogRef}
        error={state.mutationError}
        submitting={state.submitting}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
});
