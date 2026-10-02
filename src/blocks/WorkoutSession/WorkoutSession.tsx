import { type ChangeEvent, type FC, type SyntheticEvent, useCallback, useEffect } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';
import { useNavigate, useParams } from 'react-router-dom';

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
import { WorkoutSessionActions } from './Actions/WorkoutSession-Actions';
import { WorkoutSessionErrorBlock } from './ErrorBlock/WorkoutSession-ErrorBlock';
import { WorkoutSessionExerciseList } from './ExerciseList/WorkoutSession-ExerciseList';
import { WorkoutSessionForm } from './Form/WorkoutSession-Form';
import { WorkoutSessionHeader } from './Header/WorkoutSession-Header';
import { WorkoutSessionLoading } from './Loading/WorkoutSession-Loading';
import { WorkoutSessionMain } from './Main/WorkoutSession-Main';
import { WorkoutSessionMeta } from './Meta/WorkoutSession-Meta';
import type { DraftExercise, DraftSet, ExerciseAction, SetAction, SetField } from './types';

import './WorkoutSession.scss';

const cnWorkoutSession = cn('WorkoutSession');

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
  setSetValue(exercisePosition: number, setPosition: number, field: SetField, value: string): void;
};

type ValidationResult =
  | { readonly ok: true; readonly payload: UpdateWorkoutSessionRequest }
  | { readonly ok: false; readonly error: string };

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
    (action: SetAction, exercisePosition: number, setPosition?: number) => {
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
    (exercisePosition: number, setPosition: number, field: SetField, value: string) => {
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
      <WorkoutSessionMain>
        <WorkoutSessionHeader clientId={clientId} />

        {state.loading && <WorkoutSessionLoading />}

        {state.error !== undefined && <WorkoutSessionErrorBlock error={state.error} onRetry={handleRetry} />}

        {!state.loading && state.error === undefined && session !== undefined && client !== undefined && (
          <>
            <WorkoutSessionMeta client={client} session={session} />
            <WorkoutSessionForm
              actions={
                isInProgress && (
                  <WorkoutSessionActions
                    completing={state.completing}
                    disabled={mutationDisabled}
                    saving={state.saving}
                    onComplete={handleComplete}
                  />
                )
              }
              formError={state.formError}
              saveSuccess={state.saveSuccess}
              onSubmit={handleSave}
            >
              <WorkoutSessionExerciseList
                drafts={state.drafts}
                exercises={state.exercises}
                isInProgress={isInProgress}
                mutationDisabled={mutationDisabled}
                selectedExerciseId={state.selectedExerciseId}
                onAddExercise={handleAddExercise}
                onExerciseAction={handleExerciseAction}
                onExerciseChange={handleExerciseChange}
                onSetAction={handleSetAction}
                onSetChange={handleSetChange}
              />
            </WorkoutSessionForm>
          </>
        )}
      </WorkoutSessionMain>
    </div>
  );
});
