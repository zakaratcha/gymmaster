import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';
import type { FC } from 'react';

import { Loading } from './blocks/Loading/Loading';
import { LoginForm } from './blocks/LoginForm/LoginForm';
import { Profile } from './blocks/Profile/Profile';
import { checkAuth } from './services/auth/auth.service';
import { currentUserStore } from './stores/currentUser.store';

import './App.css';

const cnApp = cn('App');

export const App: FC = observer(() => {
  useEffect(() => {
    void checkAuth();
  }, []);

  if (!currentUserStore.inited) {
    return (
      <div className={cnApp()}>
        <Loading visible />
      </div>
    );
  }

  return <div className={cnApp()}>{currentUserStore.id === undefined ? <LoginForm /> : <Profile />}</div>;
});
