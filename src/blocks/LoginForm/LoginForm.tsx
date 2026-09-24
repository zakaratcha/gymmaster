import { useCallback } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';
import type { ChangeEvent, FC, SyntheticEvent } from 'react';

import { authenticate } from '../../services/auth/auth.service';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Loading } from '../Loading/Loading';

import './LoginForm.scss';

const cnLoginForm = cn('LoginForm');

type LoginFormState = {
  login: string;
  password: string;
  submitting: boolean;
  error?: string;
  setLogin(value: string): void;
  setPassword(value: string): void;
  setSubmitting(value: boolean): void;
  setError(value: string | undefined): void;
};

export const LoginForm: FC = observer(() => {
  const state = useLocalObservable<LoginFormState>(() => ({
    login: '',
    password: '',
    submitting: false,
    setLogin(value) {
      this.login = value;
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

  const handleSubmit = useCallback(
    async (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      state.setError(undefined);
      state.setSubmitting(true);

      try {
        const result = await authenticate({ email: state.login.trim(), password: state.password });
        if (!result.ok) {
          state.setError(result.error);
        }
      } finally {
        state.setSubmitting(false);
      }
    },
    [state]
  );

  const handleLoginChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      state.setLogin(event.target.value);
    },
    [state]
  );

  const handlePasswordChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      state.setPassword(event.target.value);
    },
    [state]
  );

  return (
    <div className={cnLoginForm()}>
      <main className={cnLoginForm('Main')}>
        <h1 className={cnLoginForm('Title')}>GymMaster</h1>
        <p className={cnLoginForm('Subtitle')}>Кабинет тренера</p>
        <form className={cnLoginForm('Form')} onSubmit={handleSubmit}>
          <Loading visible={state.submitting} />
          <Input
            className={cnLoginForm('LoginField')}
            id='login'
            label='Логин'
            onChange={handleLoginChange}
            placeholder='Введите логин'
            value={state.login}
          />
          <Input
            className={cnLoginForm('PasswordField')}
            id='password'
            label='Пароль'
            onChange={handlePasswordChange}
            placeholder='Введите пароль'
            type='password'
            value={state.password}
          />
          {state.error === undefined ? null : (
            <p className={cnLoginForm('Error')} role='alert'>
              {state.error}
            </p>
          )}
          <Button className={cnLoginForm('Submit')} color='primary' disabled={state.submitting} type='submit'>
            Войти
          </Button>
        </form>
      </main>
    </div>
  );
});
