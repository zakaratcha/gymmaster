import { useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';
import type { FC } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { workoutTabsStore } from '../../stores/workoutTabs.store';
import { ActiveWorkoutTabs } from '../ActiveWorkoutTabs/ActiveWorkoutTabs';

import './AppLayout.scss';

const cnAppLayout = cn('AppLayout');

export const AppLayout: FC = observer(() => {
  const { pathname } = useLocation();

  useEffect(() => {
    workoutTabsStore.rememberPath(pathname);
    void workoutTabsStore.load();
  }, [pathname]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void workoutTabsStore.load();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleRetry = useCallback(() => {
    void workoutTabsStore.load();
  }, []);

  return (
    <div className={cnAppLayout()}>
      <ActiveWorkoutTabs
        error={workoutTabsStore.error}
        homePath={workoutTabsStore.homePath}
        loaded={workoutTabsStore.loaded}
        loading={workoutTabsStore.loading}
        sessions={workoutTabsStore.sessions}
        onRetry={handleRetry}
      />
      <div className={cnAppLayout('Content')}>
        <Outlet />
      </div>
    </div>
  );
});
