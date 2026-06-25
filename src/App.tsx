import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';
import type { FC } from 'react';
import { Router } from 'react-router';

import { Loading } from './blocks/Loading/Loading';
import { LoginForm } from './blocks/LoginForm/LoginForm';
import { AppRoutes } from './routes/AppRoutes';
import { checkAuth } from './services/auth/auth.service';
import { currentUserStore } from './stores/currentUser.store';
import { history, routingStore } from './stores/routing.store';

import './App.scss';

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

  return (
    <Router location={routingStore.location} navigator={history}>
      <div className={cnApp()}>
        {currentUserStore.id === undefined ? (
          <div className={cnApp('LoginOverlay')}>
            <LoginForm />
          </div>
        ) : (
          <AppRoutes />
        )}
      </div>
    </Router>
  );
});
