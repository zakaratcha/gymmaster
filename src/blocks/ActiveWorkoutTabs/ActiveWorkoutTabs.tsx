import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { getFirstName } from '../../services/util/format/format';
import type { ActiveWorkoutSession } from '../../services/workoutSessions/workoutSessions.models';
import { ActiveWorkoutTabsError } from './Error/ActiveWorkoutTabs-Error';
import { ActiveWorkoutTabsLoading } from './Loading/ActiveWorkoutTabs-Loading';
import { ActiveWorkoutTabsTab } from './Tab/ActiveWorkoutTabs-Tab';

import './ActiveWorkoutTabs.scss';

const cnActiveWorkoutTabs = cn('ActiveWorkoutTabs');

type ActiveWorkoutTabsProps = {
  readonly sessions: readonly ActiveWorkoutSession[];
  readonly homePath: string;
  readonly error?: string;
  readonly loading: boolean;
  readonly loaded: boolean;
  onRetry(): void;
};

export const ActiveWorkoutTabs: FC<ActiveWorkoutTabsProps> = ({
  sessions,
  homePath,
  error,
  loading,
  loaded,
  onRetry
}) => {
  if (error !== undefined) {
    return <ActiveWorkoutTabsError onRetry={onRetry} />;
  }

  if (!loaded) {
    return loading ? <ActiveWorkoutTabsLoading /> : null;
  }

  if (sessions.length === 0) {
    return null;
  }

  return (
    <nav aria-label='Активные тренировки' className={cnActiveWorkoutTabs()}>
      <ActiveWorkoutTabsTab label='Главная' to={homePath} />
      {sessions.map(session => (
        <ActiveWorkoutTabsTab
          key={session.id}
          label={getFirstName(session.clientName)}
          to={`/workouts/${encodeURIComponent(session.clientId)}/${encodeURIComponent(session.id)}`}
        />
      ))}
    </nav>
  );
};
