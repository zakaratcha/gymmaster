import { useEffect } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';
import type { FC } from 'react';

import { HelloWorld } from './blocks/HelloWorld/HelloWorld';
import { Loading } from './blocks/Loading/Loading';
import { LoginForm } from './blocks/LoginForm/LoginForm';
import { checkAuth } from './services/auth/auth.service';
import { currentUserStore } from './stores/currentUser.store';

import './App.css';

const cnApp = cn('App');

type AppState = {
  ready: boolean;
  setReady(value: boolean): void;
};

export const App: FC = observer(() => {
  const state = useLocalObservable<AppState>(() => {
    const store: AppState = {
      ready: false,
      setReady(value) {
        store.ready = value;
      }
    };

    return store;
  });

  useEffect(() => {
    void checkAuth().finally(() => {
      state.setReady(true);
    });
  }, [state]);

  let content = null;
  if (state.ready) {
    content = currentUserStore.id === undefined ? <LoginForm /> : <HelloWorld />;
  }

  return (
    <div className={cnApp()}>
      <Loading visible={!state.ready} />
      {content}
    </div>
  );
});
