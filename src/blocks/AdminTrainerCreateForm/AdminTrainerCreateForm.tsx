import { type ChangeEvent, type FC, type SyntheticEvent, useCallback } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';
import { useNavigate } from 'react-router-dom';

import { ApiError } from '../../services/api/api.models';
import { createTrainer } from '../../services/trainers/trainers.service';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Loading } from '../Loading/Loading';

import './AdminTrainerCreateForm.scss';

const cnAdminTrainerCreateForm = cn('AdminTrainerCreateForm');

type AdminTrainerCreateFormState = {
  email: string;
  password: string;
  submitting: boolean;
  error?: string;
  setEmail(value: string): void;
  setPassword(value: string): void;
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

export const AdminTrainerCreateForm: FC = observer(() => {
  const navigate = useNavigate();
  const state = useLocalObservable<AdminTrainerCreateFormState>(() => ({
    email: '',
    password: '',
    submitting: false,
    setEmail(value) {
      this.email = value;
    },
    setPassword(value) {
      this.password = value;
    },
    setSubmitting(value) {
      this.submitting = value;
    },
    setError(value) {
      this.error = value;
    }
  }));

  const handleEmailChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      state.setEmail(event.target.value);
    },
    [state]
  );

  const handlePasswordChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      state.setPassword(event.target.value);
    },
    [state]
  );

  const handleSubmit = useCallback(
    (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (state.submitting) {
        return;
      }

      state.setSubmitting(true);
      state.setError(undefined);

      void createTrainer({ email: state.email, password: state.password })
        .then(() => {
          void navigate('/admin');
        })
        .catch((error: unknown) => {
          state.setError(readApiErrorMessage(error, 'Не удалось создать учётку'));
          state.setSubmitting(false);
        });
    },
    [navigate, state]
  );

  return (
    <form className={cnAdminTrainerCreateForm()} noValidate onSubmit={handleSubmit}>
      <Loading visible={state.submitting} />
      <h1 className={cnAdminTrainerCreateForm('Title')}>Новый тренер</h1>
      <p className={cnAdminTrainerCreateForm('Hint')}>
        Новая учётка получит свой trainerId и копию стартового справочника упражнений.
      </p>
      <Input
        className={cnAdminTrainerCreateForm('Email')}
        disabled={state.submitting}
        id='admin-trainer-email'
        label='Email'
        name='email'
        onChange={handleEmailChange}
        type='email'
        value={state.email}
      />
      <Input
        className={cnAdminTrainerCreateForm('Password')}
        disabled={state.submitting}
        id='admin-trainer-password'
        label='Пароль'
        name='password'
        onChange={handlePasswordChange}
        type='password'
        value={state.password}
      />
      {state.error !== undefined && (
        <p className={cnAdminTrainerCreateForm('Error')} role='alert'>
          {state.error}
        </p>
      )}
      <Button className={cnAdminTrainerCreateForm('Submit')} color='primary' disabled={state.submitting} type='submit'>
        Создать
      </Button>
    </form>
  );
});
