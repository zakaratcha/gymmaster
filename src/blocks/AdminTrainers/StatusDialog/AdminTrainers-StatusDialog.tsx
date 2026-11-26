import { type FC, useCallback } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';

import { ApiError } from '../../../services/api/api.models';
import type { TrainerStatus } from '../../../services/trainers/trainers.models';
import { setTrainerStatus } from '../../../services/trainers/trainers.service';
import { Button } from '../../Button/Button';
import { DialogActions } from '../../Dialog/Actions/Dialog-Actions';
import { DialogContent } from '../../Dialog/Content/Dialog-Content';
import { Dialog } from '../../Dialog/Dialog';
import { DialogTitle } from '../../Dialog/Title/Dialog-Title';

import './AdminTrainers-StatusDialog.scss';

const cnAdminTrainersStatusDialog = cn('AdminTrainers', 'StatusDialog');

type StatusTarget = {
  readonly id: string;
  readonly email: string;
  readonly nextStatus: TrainerStatus;
};

type AdminTrainersStatusDialogProps = {
  readonly target: StatusTarget;
  onChanged(): void;
  onClose(): void;
};

type AdminTrainersStatusDialogState = {
  submitting: boolean;
  error?: string;
  setSubmitting(value: boolean): void;
  setError(value: string | undefined): void;
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

function actionLabel(status: TrainerStatus): string {
  return status === 'blocked' ? 'Заблокировать' : 'Разблокировать';
}

export const AdminTrainersStatusDialog: FC<AdminTrainersStatusDialogProps> = observer(
  ({ target, onChanged, onClose }) => {
    const state = useLocalObservable<AdminTrainersStatusDialogState>(() => ({
      submitting: false,
      setSubmitting(value) {
        this.submitting = value;
      },
      setError(value) {
        this.error = value;
      }
    }));

    const handleClose = useCallback(() => {
      if (state.submitting) {
        return;
      }

      onClose();
    }, [onClose, state]);

    const handleConfirm = useCallback(() => {
      if (state.submitting) {
        return;
      }

      state.setSubmitting(true);
      state.setError(undefined);

      void setTrainerStatus(target.id, target.nextStatus)
        .then(() => {
          onChanged();
        })
        .catch((error: unknown) => {
          state.setError(readApiErrorMessage(error, 'Не удалось изменить статус'));
        })
        .finally(() => {
          state.setSubmitting(false);
        });
    }, [onChanged, state, target.id, target.nextStatus]);

    const label = actionLabel(target.nextStatus);

    return (
      <Dialog ariaLabel='Подтверждение смены статуса' className={cnAdminTrainersStatusDialog()} onCancel={handleClose}>
        <DialogTitle>{label} учётку?</DialogTitle>
        <DialogContent>
          <p>
            {label} учётку {target.email}?
          </p>
          {state.error !== undefined && <p role='alert'>{state.error}</p>}
        </DialogContent>
        <DialogActions>
          <Button disabled={state.submitting} onClick={handleClose} type='button'>
            Отмена
          </Button>
          <Button color='primary' disabled={state.submitting} onClick={handleConfirm} type='button'>
            {label}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);
