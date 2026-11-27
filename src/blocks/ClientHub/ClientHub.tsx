import { type FC, type SyntheticEvent, useCallback, useEffect, useRef } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';
import { useNavigate, useParams } from 'react-router-dom';

import { ApiError } from '../../services/api/api.models';
import type { Client } from '../../services/clients/clients.models';
import { deleteClient, getClientById, updateClient } from '../../services/clients/clients.service';
import type { PlannedWorkout } from '../../services/plans/plans.models';
import { listPlans } from '../../services/plans/plans.service';
import { addSplitTag, listSplitTags } from '../../services/splitTags/splitTags.service';
import type { WorkoutSession } from '../../services/workoutSessions/workoutSessions.models';
import {
  createWorkoutSession,
  getActiveWorkoutSession,
  getLatestCompletedWorkoutSession
} from '../../services/workoutSessions/workoutSessions.service';
import { ClientCreateForm } from '../ClientCreateForm/ClientCreateForm';
import { ClientHubContent } from './Content/ClientHub-Content';
import { ClientHubDeleteDialog } from './DeleteDialog/ClientHub-DeleteDialog';
import { ClientHubEmptyStartDialog } from './EmptyStartDialog/ClientHub-EmptyStartDialog';
import { ClientHubExerciseHistoryDialog } from './ExerciseHistoryDialog/ClientHub-ExerciseHistoryDialog';
import { ClientHubHeader } from './Header/ClientHub-Header';
import { ClientHubMain } from './Main/ClientHub-Main';
import { ClientHubSplitTagDialog } from './SplitTagDialog/ClientHub-SplitTagDialog';
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
  splitTags: readonly string[];
  splitTagsLoading: boolean;
  splitTagsError?: string;
  splitTagDialogOpen: boolean;
  splitTagDraft: string;
  splitTagError?: string;
  addingSplitTag: boolean;
  emptyStartDialogOpen: boolean;
  emptyStartTag: string;
  emptyStartError?: string;
  historyDialogOpen: boolean;
  startDialogOpen: boolean;
  selectedPlanId: string;
  starting: boolean;
  startingError?: string;
  deleteDialogOpen: boolean;
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
  applyUpdatedClient(value: Client): void;
  closeDeleteDialogAfterRemoval(): void;
  setPlans(value: readonly PlannedWorkout[]): void;
  setPlansLoading(value: boolean): void;
  setPlansError(value: string | undefined): void;
  setActiveSession(value: WorkoutSession | null): void;
  setLatestCompletedSession(value: WorkoutSession | null): void;
  setSessionsLoading(value: boolean): void;
  setSessionsError(value: string | undefined): void;
  setSplitTags(value: readonly string[]): void;
  setSplitTagsLoading(value: boolean): void;
  setSplitTagsError(value: string | undefined): void;
  openSplitTagDialog(): void;
  closeSplitTagDialog(): void;
  setSplitTagDraft(value: string): void;
  setSplitTagError(value: string | undefined): void;
  setAddingSplitTag(value: boolean): void;
  applyAddedSplitTags(value: readonly string[]): void;
  openEmptyStartDialog(): void;
  closeEmptyStartDialog(): void;
  setEmptyStartTag(value: string): void;
  setEmptyStartError(value: string | undefined): void;
  openStartDialog(): void;
  closeStartDialog(): void;
  openHistoryDialog(): void;
  closeHistoryDialog(): void;
  openDeleteDialog(): void;
  closeDeleteDialog(): void;
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

function getEmptyStartWorkoutErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return 'Клиент не найден';
  }

  return getStartWorkoutErrorMessage(error);
}

export const ClientHub: FC<ClientHubProps> = observer(({ initialClient }) => {
  const staticMode = initialClient !== undefined;
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const clientGenerationRef = useRef(0);
  const plansGenerationRef = useRef(0);
  const sessionsGenerationRef = useRef(0);
  const splitTagsGenerationRef = useRef(0);

  const state = useLocalObservable<ClientHubState>(() => ({
    client: initialClient,
    plans: [],
    plansLoading: !staticMode,
    activeSession: null,
    latestCompletedSession: null,
    sessionsLoading: !staticMode,
    splitTags: [],
    splitTagsLoading: !staticMode,
    splitTagDialogOpen: false,
    splitTagDraft: '',
    addingSplitTag: false,
    emptyStartDialogOpen: false,
    emptyStartTag: '',
    historyDialogOpen: false,
    startDialogOpen: false,
    selectedPlanId: '',
    starting: false,
    startingError: undefined,
    deleteDialogOpen: false,
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
    applyUpdatedClient(value) {
      this.client = value;
      this.editOpen = false;
    },
    closeDeleteDialogAfterRemoval() {
      this.deleteDialogOpen = false;
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
    setSplitTags(value) {
      this.splitTags = value;
    },
    setSplitTagsLoading(value) {
      this.splitTagsLoading = value;
    },
    setSplitTagsError(value) {
      this.splitTagsError = value;
    },
    openSplitTagDialog() {
      this.splitTagDraft = '';
      this.splitTagError = undefined;
      this.splitTagDialogOpen = true;
    },
    closeSplitTagDialog() {
      if (!this.addingSplitTag) {
        this.splitTagDialogOpen = false;
      }
    },
    setSplitTagDraft(value) {
      this.splitTagDraft = value;
    },
    setSplitTagError(value) {
      this.splitTagError = value;
    },
    setAddingSplitTag(value) {
      this.addingSplitTag = value;
    },
    applyAddedSplitTags(value) {
      this.splitTags = value;
      this.splitTagsError = undefined;
      this.splitTagDialogOpen = false;
    },
    openEmptyStartDialog() {
      this.emptyStartTag = '';
      this.emptyStartError = undefined;
      this.emptyStartDialogOpen = true;
    },
    closeEmptyStartDialog() {
      if (!this.starting) {
        this.emptyStartDialogOpen = false;
      }
    },
    setEmptyStartTag(value) {
      this.emptyStartTag = value;
    },
    setEmptyStartError(value) {
      this.emptyStartError = value;
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
    openHistoryDialog() {
      this.historyDialogOpen = true;
    },
    closeHistoryDialog() {
      this.historyDialogOpen = false;
    },
    openDeleteDialog() {
      this.mutationError = undefined;
      this.deleteDialogOpen = true;
    },
    closeDeleteDialog() {
      if (!this.submitting) {
        this.deleteDialogOpen = false;
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
    clientGenerationRef.current += 1;
    const generation = clientGenerationRef.current;
    if (id === undefined || id.length === 0) {
      state.setError('Клиент не найден');
      state.setLoading(false);
      return;
    }

    state.setLoading(true);
    state.setError(undefined);

    try {
      const loadedClient = await getClientById(id);
      if (clientGenerationRef.current === generation) {
        state.setClient(loadedClient);
      }
    } catch {
      if (clientGenerationRef.current === generation) {
        state.setError('Не удалось загрузить клиента');
        state.setClient(undefined);
      }
    } finally {
      if (clientGenerationRef.current === generation) {
        state.setLoading(false);
      }
    }
  }, [id, state]);

  const loadPlans = useCallback(async () => {
    plansGenerationRef.current += 1;
    const generation = plansGenerationRef.current;
    if (staticMode || id === undefined || id.length === 0) {
      state.setPlansLoading(false);
      return;
    }

    state.setPlansLoading(true);
    state.setPlansError(undefined);
    try {
      const plans = await listPlans(id);
      if (plansGenerationRef.current === generation) {
        state.setPlans(plans);
      }
    } catch {
      if (plansGenerationRef.current === generation) {
        state.setPlansError('Не удалось загрузить планы');
      }
    } finally {
      if (plansGenerationRef.current === generation) {
        state.setPlansLoading(false);
      }
    }
  }, [id, state, staticMode]);

  const loadSessions = useCallback(async () => {
    sessionsGenerationRef.current += 1;
    const generation = sessionsGenerationRef.current;
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
      if (sessionsGenerationRef.current === generation) {
        state.setActiveSession(activeSession);
        state.setLatestCompletedSession(latestCompletedSession);
      }
    } catch {
      if (sessionsGenerationRef.current === generation) {
        state.setSessionsError('Не удалось загрузить тренировки');
      }
    } finally {
      if (sessionsGenerationRef.current === generation) {
        state.setSessionsLoading(false);
      }
    }
  }, [id, state, staticMode]);

  const loadSplitTags = useCallback(async () => {
    splitTagsGenerationRef.current += 1;
    const generation = splitTagsGenerationRef.current;
    if (staticMode || id === undefined || id.length === 0) {
      state.setSplitTagsLoading(false);
      return;
    }

    state.setSplitTagsLoading(true);
    state.setSplitTagsError(undefined);
    try {
      const splitTags = await listSplitTags(id);
      if (splitTagsGenerationRef.current === generation) {
        state.setSplitTags(splitTags);
      }
    } catch {
      if (splitTagsGenerationRef.current === generation) {
        state.setSplitTagsError('Не удалось загрузить теги');
      }
    } finally {
      if (splitTagsGenerationRef.current === generation) {
        state.setSplitTagsLoading(false);
      }
    }
  }, [id, state, staticMode]);

  useEffect(() => {
    if (staticMode) {
      return;
    }

    void loadClient();
    void loadPlans();
    void loadSessions();
    void loadSplitTags();
  }, [loadClient, loadPlans, loadSessions, loadSplitTags, staticMode]);

  const handleRetry = useCallback(() => {
    void loadClient();
  }, [loadClient]);

  const handlePlansRetry = useCallback(() => {
    void loadPlans();
  }, [loadPlans]);

  const handleSessionsRetry = useCallback(() => {
    void loadSessions();
  }, [loadSessions]);

  const handleSplitTagsRetry = useCallback(() => {
    void loadSplitTags();
  }, [loadSplitTags]);

  const handleSplitTagOpen = useCallback(() => {
    state.openSplitTagDialog();
  }, [state]);

  const handleSplitTagCancel = useCallback(() => {
    state.closeSplitTagDialog();
  }, [state]);

  const handleSplitTagSubmit = useCallback(
    async (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (id === undefined || state.addingSplitTag) {
        return;
      }

      const tag = state.splitTagDraft.trim();
      if (tag.length === 0) {
        state.setSplitTagError('Укажите тег');
        return;
      }

      if (staticMode) {
        state.setSplitTagError('Сохранение недоступно в демонстрационном режиме');
        return;
      }

      state.setSplitTagError(undefined);
      state.setAddingSplitTag(true);
      try {
        state.applyAddedSplitTags(await addSplitTag(id, tag));
      } catch {
        state.setSplitTagError('Не удалось добавить тег');
      } finally {
        state.setAddingSplitTag(false);
      }
    },
    [id, state, staticMode]
  );

  const handleEmptyStartOpen = useCallback(() => {
    state.openEmptyStartDialog();
  }, [state]);

  const handleEmptyStartCancel = useCallback(() => {
    state.closeEmptyStartDialog();
  }, [state]);

  const handleEmptyStart = useCallback(
    async (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (id === undefined || state.starting || state.activeSession !== null) {
        return;
      }

      const splitTag = state.emptyStartTag.trim();
      if (splitTag.length === 0) {
        state.setEmptyStartError('Укажите тег дня');
        return;
      }

      if (staticMode) {
        state.setEmptyStartError('Запуск недоступен в демонстрационном режиме');
        return;
      }

      state.setEmptyStartError(undefined);
      state.setStarting(true);
      try {
        const session = await createWorkoutSession(id, { splitTag });
        state.setActiveSession(session);
        await navigate(`/workouts/${session.clientId}/${session.id}`);
      } catch (error) {
        state.setEmptyStartError(getEmptyStartWorkoutErrorMessage(error));
      } finally {
        state.setStarting(false);
      }
    },
    [id, navigate, state, staticMode]
  );

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
        state.applyUpdatedClient(updated);
      } catch {
        state.setMutationError('Не удалось сохранить клиента');
      } finally {
        state.setSubmitting(false);
      }
    },
    [state, staticMode]
  );

  const handleDeleteOpen = useCallback(() => {
    state.openDeleteDialog();
  }, [state]);

  const handleDeleteCancel = useCallback(() => {
    state.closeDeleteDialog();
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
      state.closeDeleteDialogAfterRemoval();
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

  const handleHistoryOpen = useCallback(() => {
    state.openHistoryDialog();
  }, [state]);

  const handleHistoryCancel = useCallback(() => {
    state.closeHistoryDialog();
  }, [state]);

  const handleHistorySelect = useCallback(
    (exerciseId: string) => {
      state.closeHistoryDialog();
      if (id === undefined || id.length === 0) {
        return;
      }

      void navigate(`/clients/${encodeURIComponent(id)}/exercises/${encodeURIComponent(exerciseId)}/history`);
    },
    [id, navigate, state]
  );

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
          splitTags={state.splitTags}
          splitTagsError={state.splitTagsError}
          splitTagsLoading={state.splitTagsLoading}
          staticMode={staticMode}
          onAllPlans={handleAllPlans}
          onDelete={handleDeleteOpen}
          onEmptyStartOpen={handleEmptyStartOpen}
          onHistoryOpen={handleHistoryOpen}
          onPlansRetry={handlePlansRetry}
          onRetry={handleRetry}
          onSessionsRetry={handleSessionsRetry}
          onSplitTagAdd={handleSplitTagOpen}
          onSplitTagsRetry={handleSplitTagsRetry}
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
      {state.historyDialogOpen && (
        <ClientHubExerciseHistoryDialog onCancel={handleHistoryCancel} onSelect={handleHistorySelect} />
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
      {state.emptyStartDialogOpen && (
        <ClientHubEmptyStartDialog
          error={state.emptyStartError}
          starting={state.starting}
          tags={state.splitTags}
          value={state.emptyStartTag}
          onCancel={handleEmptyStartCancel}
          onChange={state.setEmptyStartTag}
          onSubmit={handleEmptyStart}
        />
      )}
      {state.splitTagDialogOpen && (
        <ClientHubSplitTagDialog
          error={state.splitTagError}
          submitting={state.addingSplitTag}
          value={state.splitTagDraft}
          onCancel={handleSplitTagCancel}
          onChange={state.setSplitTagDraft}
          onSubmit={handleSplitTagSubmit}
        />
      )}
      {state.deleteDialogOpen && (
        <ClientHubDeleteDialog
          client={state.client}
          error={state.mutationError}
          submitting={state.submitting}
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
});
