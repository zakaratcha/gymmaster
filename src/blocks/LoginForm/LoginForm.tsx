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
  const { login, password, submitting, error, setLogin, setPassword, setSubmitting, setError } =
    useLocalObservable<LoginFormState>(() => ({
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
      setError(undefined);
      setSubmitting(true);

      try {
        const result = await authenticate({ email: login.trim(), password });
        if (!result.ok) {
          setError(result.error);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [login, password, setError, setSubmitting]
  );

  const handleLoginChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setLogin(event.target.value);
    },
    [setLogin]
  );

  const handlePasswordChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setPassword(event.target.value);
    },
    [setPassword]
  );

  return (
    <div className={cnLoginForm()}>
      <main className={cnLoginForm('Main')}>
        <h1 className={cnLoginForm('Title')}>GymMaster</h1>
        <p className={cnLoginForm('Subtitle')}>Кабинет тренера</p>
        <form className={cnLoginForm('Form')} onSubmit={handleSubmit}>
          <Loading visible={submitting} />
          <Input
            className={cnLoginForm('LoginField')}
            id='login'
            label='Логин'
            onChange={handleLoginChange}
            placeholder='Введите логин'
            value={login}
          />
          <Input
            className={cnLoginForm('PasswordField')}
            id='password'
            label='Пароль'
            onChange={handlePasswordChange}
            placeholder='Введите пароль'
            type='password'
            value={password}
          />
          {error === undefined ? null : (
            <p className={cnLoginForm('Error')} role='alert'>
              {error}
            </p>
          )}
          <Button className={cnLoginForm('Submit')} color='primary' disabled={submitting} type='submit'>
            Войти
          </Button>
        </form>
      </main>
    </div>
  );
});
