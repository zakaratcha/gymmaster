import { type ChangeEvent, type FC, useCallback } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';

import { ApiError } from '../../../services/api/api.models';
import { resetTrainerPassword } from '../../../services/trainers/trainers.service';
import { Button } from '../../Button/Button';
import { DialogActions } from '../../Dialog/Actions/Dialog-Actions';
import { DialogContent } from '../../Dialog/Content/Dialog-Content';
import { Dialog } from '../../Dialog/Dialog';
import { DialogTitle } from '../../Dialog/Title/Dialog-Title';
import { Input } from '../../Input/Input';

import './AdminTrainers-PasswordDialog.scss';

const cnAdminTrainersPasswordDialog = cn('AdminTrainers', 'PasswordDialog');

type PasswordTarget = {
  readonly id: string;
  readonly email: string;
};

type AdminTrainersPasswordDialogProps = {
  readonly target: PasswordTarget;
  onChanged(): void;
  onClose(): void;
};

type AdminTrainersPasswordDialogState = {
  password: string;
  revealedPassword?: string;
  submitting: boolean;
  error?: string;
  setPassword(value: string): void;
  setRevealedPassword(value: string): void;
  setSubmitting(value: boolean): void;
  setError(value: string | undefined): void;
  clearSecret(): void;
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

export const AdminTrainersPasswordDialog: FC<AdminTrainersPasswordDialogProps> = observer(
  ({ target, onChanged, onClose }) => {
    const state = useLocalObservable<AdminTrainersPasswordDialogState>(() => ({
      password: '',
      submitting: false,
      setPassword(value) {
        this.password = value;
      },
      setRevealedPassword(value) {
        this.revealedPassword = value;
      },
      setSubmitting(value) {
        this.submitting = value;
      },
      setError(value) {
        this.error = value;
      },
      clearSecret() {
        this.password = '';
        this.revealedPassword = undefined;
        this.error = undefined;
      }
    }));

    const handleClose = useCallback(() => {
      if (state.submitting) {
        return;
      }

      state.clearSecret();
      onClose();
    }, [onClose, state]);

    const handlePasswordChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        state.setPassword(event.target.value);
      },
      [state]
    );

    const handleConfirm = useCallback(() => {
      if (state.submitting) {
        return;
      }

      const password = state.password;
      state.setSubmitting(true);
      state.setError(undefined);

      void resetTrainerPassword(target.id, password)
        .then(() => {
          state.setRevealedPassword(password);
          state.setPassword('');
          onChanged();
        })
        .catch((error: unknown) => {
          state.setError(readApiErrorMessage(error, 'Не удалось сбросить пароль'));
        })
        .finally(() => {
          state.setSubmitting(false);
        });
    }, [onChanged, state, target.id]);

    const revealed = state.revealedPassword !== undefined;

    return (
      <Dialog ariaLabel='Сброс пароля' className={cnAdminTrainersPasswordDialog()} onCancel={handleClose}>
        <DialogTitle>Сбросить пароль</DialogTitle>
        <DialogContent>
          <p>Новый временный пароль для {target.email}</p>
          {revealed ? (
            <p>{state.revealedPassword}</p>
          ) : (
            <Input
              disabled={state.submitting}
              id='admin-trainer-temp-password'
              label='Временный пароль'
              onChange={handlePasswordChange}
              type='text'
              value={state.password}
            />
          )}
          {state.error !== undefined && <p role='alert'>{state.error}</p>}
        </DialogContent>
        <DialogActions>
          {revealed ? (
            <Button onClick={handleClose} type='button'>
              Закрыть
            </Button>
          ) : (
            <>
              <Button disabled={state.submitting} onClick={handleClose} type='button'>
                Отмена
              </Button>
              <Button color='primary' disabled={state.submitting} onClick={handleConfirm} type='button'>
                Сбросить пароль
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    );
  }
);
