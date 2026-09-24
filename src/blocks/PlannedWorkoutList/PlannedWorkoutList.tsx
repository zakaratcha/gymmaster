import { type FC, type SyntheticEvent, useCallback, useEffect } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';
import { Link, useNavigate, useParams } from 'react-router-dom';

import type { Client } from '../../services/clients/clients.models';
import { getClientById } from '../../services/clients/clients.service';
import type { PlannedWorkout } from '../../services/plans/plans.models';
import { deletePlan, listPlans } from '../../services/plans/plans.service';
import { Button } from '../Button/Button';
import { DialogActions } from '../Dialog/Actions/Dialog-Actions';
import { DialogContent } from '../Dialog/Content/Dialog-Content';
import { Dialog } from '../Dialog/Dialog';
import { DialogTitle } from '../Dialog/Title/Dialog-Title';
import { Loading } from '../Loading/Loading';

import './PlannedWorkoutList.scss';

const cnPlannedWorkoutList = cn('PlannedWorkoutList');

type PlannedWorkoutListState = {
  client?: Client;
  plans: readonly PlannedWorkout[];
  loading: boolean;
  error?: string;
  deleteTarget?: PlannedWorkout;
  deleteSubmitting: boolean;
  deleteError?: string;
  setClient(value: Client): void;
  setPlans(value: readonly PlannedWorkout[]): void;
  setLoading(value: boolean): void;
  setError(value: string | undefined): void;
  openDeleteDialog(plan: PlannedWorkout): void;
  closeDeleteDialog(): void;
  setDeleteSubmitting(value: boolean): void;
  setDeleteError(value: string | undefined): void;
};

function formatDate(value: string): string {
  const [year, month, day] = value.split('-');
  return `${day}.${month}.${year}`;
}

function formatPlanSummary(plan: PlannedWorkout): string {
  const setCount = plan.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  return `${plan.exercises.length} упр. · ${setCount} подходов`;
}

export const PlannedWorkoutList: FC = observer(() => {
  const navigate = useNavigate();
  const { id: clientId } = useParams<{ id: string }>();
  const state = useLocalObservable<PlannedWorkoutListState>(() => ({
    plans: [],
    loading: true,
    deleteSubmitting: false,
    setClient(value) {
      this.client = value;
    },
    setPlans(value) {
      this.plans = value;
    },
    setLoading(value) {
      this.loading = value;
    },
    setError(value) {
      this.error = value;
    },
    openDeleteDialog(plan) {
      this.deleteTarget = plan;
      this.deleteError = undefined;
    },
    closeDeleteDialog() {
      if (!this.deleteSubmitting) {
        this.deleteTarget = undefined;
      }
    },
    setDeleteSubmitting(value) {
      this.deleteSubmitting = value;
    },
    setDeleteError(value) {
      this.deleteError = value;
    }
  }));

  const loadPlans = useCallback(async () => {
    if (clientId === undefined || clientId.length === 0) {
      state.setError('Клиент не найден');
      state.setLoading(false);
      return;
    }

    state.setLoading(true);
    state.setError(undefined);
    try {
      const [client, plans] = await Promise.all([getClientById(clientId), listPlans(clientId)]);
      state.setClient(client);
      state.setPlans(plans);
    } catch {
      state.setError('Не удалось загрузить планы');
    } finally {
      state.setLoading(false);
    }
  }, [clientId, state]);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  const handleCreate = useCallback(() => {
    if (clientId !== undefined) {
      void navigate(`/clients/${clientId}/plans/new`);
    }
  }, [clientId, navigate]);

  const handleOpenPlan = useCallback(
    (planId: string) => {
      if (clientId !== undefined) {
        void navigate(`/clients/${clientId}/plans/${planId}`);
      }
    },
    [clientId, navigate]
  );

  const handleOpenPlanClick = useCallback(
    (event: SyntheticEvent<HTMLButtonElement>) => {
      const planId = event.currentTarget.dataset.planId;
      if (planId !== undefined) {
        handleOpenPlan(planId);
      }
    },
    [handleOpenPlan]
  );

  const handleDeleteOpenClick = useCallback(
    (event: SyntheticEvent<HTMLButtonElement>) => {
      const planId = event.currentTarget.dataset.planId;
      const plan = state.plans.find(item => item.id === planId);
      if (plan !== undefined) {
        state.openDeleteDialog(plan);
      }
    },
    [state]
  );

  const handleRetry = useCallback(() => {
    void loadPlans();
  }, [loadPlans]);

  const handleDelete = useCallback(async () => {
    if (state.deleteTarget === undefined || clientId === undefined || state.deleteSubmitting) {
      return;
    }

    state.setDeleteSubmitting(true);
    state.setDeleteError(undefined);
    try {
      await deletePlan(clientId, state.deleteTarget.id);
      state.setPlans(state.plans.filter(plan => plan.id !== state.deleteTarget?.id));
      state.setDeleteSubmitting(false);
      state.closeDeleteDialog();
    } catch {
      state.setDeleteError('Не удалось удалить план');
    } finally {
      state.setDeleteSubmitting(false);
    }
  }, [clientId, state]);

  return (
    <div className={cnPlannedWorkoutList()}>
      <main className={cnPlannedWorkoutList('Main')}>
        <header className={cnPlannedWorkoutList('Header')}>
          <Link
            aria-label='Назад к карточке клиента'
            className={cnPlannedWorkoutList('Back')}
            to={clientId === undefined ? '/clients' : `/clients/${clientId}`}
          >
            ←
          </Link>
          <h1 className={cnPlannedWorkoutList('Title')}>Планы · {state.client?.name ?? 'клиент'}</h1>
          <Button className={cnPlannedWorkoutList('Create')} disabled={clientId === undefined} onClick={handleCreate}>
            + План
          </Button>
        </header>

        <div className={cnPlannedWorkoutList('Content')}>
          {state.loading && <Loading className={cnPlannedWorkoutList('Loading')} visible />}

          {state.error !== undefined && (
            <div className={cnPlannedWorkoutList('ErrorBlock')}>
              <p className={cnPlannedWorkoutList('Error')}>{state.error}</p>
              <Button className={cnPlannedWorkoutList('Retry')} color='secondary' onClick={handleRetry}>
                Повторить
              </Button>
            </div>
          )}

          {!state.loading && state.error === undefined && state.plans.length === 0 && (
            <div className={cnPlannedWorkoutList('Empty')}>
              <p>Нет предстоящих планов</p>
              <Button color='secondary' onClick={handleCreate}>
                Создать план
              </Button>
            </div>
          )}

          {!state.loading && state.error === undefined && state.plans.length > 0 && (
            <ul className={cnPlannedWorkoutList('List')}>
              {state.plans.map(plan => (
                <li className={cnPlannedWorkoutList('Item')} key={plan.id}>
                  <button
                    className={cnPlannedWorkoutList('Row')}
                    data-plan-id={plan.id}
                    onClick={handleOpenPlanClick}
                    type='button'
                  >
                    <span className={cnPlannedWorkoutList('Date')}>{formatDate(plan.plannedDate)}</span>
                    <span className={cnPlannedWorkoutList('Details')}>
                      <strong>{plan.splitTag}</strong>
                      <span>{formatPlanSummary(plan)}</span>
                    </span>
                  </button>
                  <Button
                    aria-label={`Удалить план ${plan.splitTag}`}
                    className={cnPlannedWorkoutList('Delete')}
                    color='secondary'
                    onClick={handleDeleteOpenClick}
                    data-plan-id={plan.id}
                  >
                    Удалить
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {state.deleteTarget !== undefined && (
        <Dialog
          ariaLabel='Удалить план тренировки?'
          className={cnPlannedWorkoutList('DeleteDialog')}
          onCancel={state.closeDeleteDialog}
        >
          <DialogTitle>Удалить план тренировки?</DialogTitle>
          <DialogContent>
            <p>План «{state.deleteTarget.splitTag}» будет удалён.</p>
            {state.deleteError !== undefined && <p role='alert'>{state.deleteError}</p>}
          </DialogContent>
          <DialogActions>
            <Button disabled={state.deleteSubmitting} onClick={state.closeDeleteDialog}>
              Отмена
            </Button>
            <Button disabled={state.deleteSubmitting} onClick={handleDelete}>
              {state.deleteSubmitting ? 'Удаление…' : 'Удалить'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
});
