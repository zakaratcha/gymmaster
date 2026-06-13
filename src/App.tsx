import { observer } from 'mobx-react-lite';
import type { FC } from 'react';

import { HelloWorld } from './blocks/HelloWorld/HelloWorld';
import { LoginForm } from './blocks/LoginForm/LoginForm';
import { currentUserStore } from './stores/currentUser.store';

export const App: FC = observer(() => {
  if (currentUserStore.id === undefined) {
    return <LoginForm />;
  }

  return <HelloWorld />;
});
