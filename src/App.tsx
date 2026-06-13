import { useCallback, useState } from 'react';
import { cn } from '@bem-react/classname';
import type { ChangeEvent, FC, SyntheticEvent } from 'react';

import { Button } from './blocks/Button/Button';
import { Input } from './blocks/Input/Input';

import './App.css';

const classname = cn('App');

export const App: FC = () => {
  const [login, setLogin] = useState('');

  const handleSubmit = useCallback((event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
  }, []);

  const handleLoginChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setLogin(event.target.value);
  }, []);

  return (
    <div className={classname()}>
      <main className={classname('Main')}>
        <h1 className={classname('Title')}>GymMaster</h1>
        <p className={classname('Subtitle')}>Кабинет тренера</p>
        <form className={classname('Form')} onSubmit={handleSubmit}>
          <Input id='login' label='Логин' onChange={handleLoginChange} placeholder='Введите логин' value={login} />
          <Input id='password' label='Пароль' placeholder='Введите пароль' type='password' />
          <Button color='primary' type='submit'>
            Войти
          </Button>
        </form>
      </main>
    </div>
  );
};
