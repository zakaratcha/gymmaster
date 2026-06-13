import { useCallback } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';
import type { ChangeEvent, FC, SyntheticEvent } from 'react';

import { Button } from '../Button/Button';
import { Input } from '../Input/Input';

import './LoginForm.css';

const cnLoginForm = cn('LoginForm');

type LoginFormState = {
  login: string;
  password: string;
  setLogin(value: string): void;
  setPassword(value: string): void;
};

export const LoginForm: FC = observer(() => {
  const { login, password, setLogin, setPassword } = useLocalObservable<LoginFormState>(() => {
    const store: LoginFormState = {
      login: '',
      password: '',
      setLogin(value) {
        store.login = value;
      },
      setPassword(value) {
        store.password = value;
      }
    };

    return store;
  });

  const handleSubmit = useCallback((event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
  }, []);

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
          <Input id='login' label='Логин' onChange={handleLoginChange} placeholder='Введите логин' value={login} />
          <Input
            id='password'
            label='Пароль'
            onChange={handlePasswordChange}
            placeholder='Введите пароль'
            type='password'
            value={password}
          />
          <Button color='primary' type='submit'>
            Войти
          </Button>
        </form>
      </main>
    </div>
  );
});
