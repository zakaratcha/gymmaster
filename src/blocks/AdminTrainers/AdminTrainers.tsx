import { type FC, useCallback, useEffect } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';

import { ApiError } from '../../services/api/api.models';
import type { AdminTrainer, TrainerStatus } from '../../services/trainers/trainers.models';
import { listAdminTrainers } from '../../services/trainers/trainers.service';
import { AdminTrainersCreate } from './Create/AdminTrainers-Create';
import { AdminTrainersEmpty } from './Empty/AdminTrainers-Empty';
import { AdminTrainersError } from './Error/AdminTrainers-Error';
import { AdminTrainersList } from './List/AdminTrainers-List';
import { AdminTrainersLoading } from './Loading/AdminTrainers-Loading';
import { AdminTrainersPasswordDialog } from './PasswordDialog/AdminTrainers-PasswordDialog';
import { AdminTrainersStatusDialog } from './StatusDialog/AdminTrainers-StatusDialog';

import './AdminTrainers.scss';

const cnAdminTrainers = cn('AdminTrainers');

type StatusTarget = {
  readonly id: string;
  readonly email: string;
  readonly nextStatus: TrainerStatus;
};

type PasswordTarget = {
  readonly id: string;
  readonly email: string;
};

type AdminTrainersState = {
  trainers: readonly AdminTrainer[];
  loading: boolean;
  error?: string;
  reloadToken: number;
  statusTarget?: StatusTarget;
  passwordTarget?: PasswordTarget;
  setTrainers(value: readonly AdminTrainer[]): void;
  setLoading(value: boolean): void;
  setError(value: string | undefined): void;
  reload(): void;
  openStatus(target: StatusTarget): void;
  closeStatus(): void;
  openPassword(target: PasswordTarget): void;
  closePassword(): void;
};

function readApiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiError)) {
    return fallback;
  }

  if (typeof error.body !== 'object' || error.body === null || !Object.hasOwn(error.body, 'error')) {
    return fallback;
  }

  const message: unknown = Reflect.get(error.body, 'error');
  return typeof message === 'string' && message.length > 0 ? message : fallback;
}

export const AdminTrainers: FC = observer(() => {
  const state = useLocalObservable<AdminTrainersState>(() => ({
    trainers: [],
    loading: true,
    reloadToken: 0,
    setTrainers(value) {
      this.trainers = value;
    },
    setLoading(value) {
      this.loading = value;
    },
    setError(value) {
      this.error = value;
    },
    reload() {
      this.reloadToken += 1;
    },
    openStatus(target) {
      this.statusTarget = target;
    },
    closeStatus() {
      this.statusTarget = undefined;
    },
    openPassword(target) {
      this.passwordTarget = target;
    },
    closePassword() {
      this.passwordTarget = undefined;
    }
  }));

  const reloadToken = state.reloadToken;

  useEffect(() => {
    let cancelled = false;
    state.setLoading(true);
    state.setError(undefined);

    void listAdminTrainers()
      .then(trainers => {
        if (!cancelled) {
          state.setTrainers(trainers);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          state.setTrainers([]);
          state.setError(readApiErrorMessage(error, 'Не удалось загрузить список'));
        }
      })
      .finally(() => {
        if (!cancelled) {
          state.setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [state, reloadToken]);

  const handleRetry = useCallback(() => {
    state.reload();
  }, [state]);

  const handleBlock = useCallback(
    (trainer: AdminTrainer) => {
      state.openStatus({ id: trainer.id, email: trainer.email, nextStatus: 'blocked' });
    },
    [state]
  );

  const handleUnblock = useCallback(
    (trainer: AdminTrainer) => {
      state.openStatus({ id: trainer.id, email: trainer.email, nextStatus: 'active' });
    },
    [state]
  );

  const handleResetPassword = useCallback(
    (trainer: AdminTrainer) => {
      state.openPassword({ id: trainer.id, email: trainer.email });
    },
    [state]
  );

  const handleCloseStatus = useCallback(() => {
    state.closeStatus();
  }, [state]);

  const handleClosePassword = useCallback(() => {
    state.closePassword();
  }, [state]);

  const handleStatusChanged = useCallback(() => {
    state.closeStatus();
    state.reload();
  }, [state]);

  const handlePasswordChanged = useCallback(() => {
    state.reload();
  }, [state]);

  const showList = !state.loading && state.error === undefined && state.trainers.length > 0;
  const showEmpty = !state.loading && state.error === undefined && state.trainers.length === 0;

  return (
    <section className={cnAdminTrainers()}>
      <AdminTrainersCreate />
      {state.loading && <AdminTrainersLoading />}
      {!state.loading && state.error !== undefined && <AdminTrainersError error={state.error} onRetry={handleRetry} />}
      {showEmpty && <AdminTrainersEmpty />}
      {showList && (
        <AdminTrainersList
          trainers={state.trainers}
          onBlock={handleBlock}
          onResetPassword={handleResetPassword}
          onUnblock={handleUnblock}
        />
      )}
      {state.statusTarget !== undefined && (
        <AdminTrainersStatusDialog
          target={state.statusTarget}
          onChanged={handleStatusChanged}
          onClose={handleCloseStatus}
        />
      )}
      {state.passwordTarget !== undefined && (
        <AdminTrainersPasswordDialog
          target={state.passwordTarget}
          onChanged={handlePasswordChanged}
          onClose={handleClosePassword}
        />
      )}
    </section>
  );
});
