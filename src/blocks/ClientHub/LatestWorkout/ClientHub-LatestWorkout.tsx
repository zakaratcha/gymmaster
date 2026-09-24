import { type FC } from 'react';
import { cn } from '@bem-react/classname';
import { Link } from 'react-router-dom';

import type { WorkoutSession } from '../../../services/workoutSessions/workoutSessions.models';
import { Button } from '../../Button/Button';
import { Loading } from '../../Loading/Loading';
import { formatSessionTimestamp, formatWorkoutCount } from '../format';
import { ClientHubSection } from '../Section/ClientHub-Section';
import { ClientHubStubText } from '../StubText/ClientHub-StubText';

import './ClientHub-LatestWorkout.scss';

const cnClientHub = cn('ClientHub');

type ClientHubLatestWorkoutProps = {
  readonly error: string | undefined;
  readonly loading: boolean;
  readonly session: WorkoutSession | null;
  onRetry(): void;
};

export const ClientHubLatestWorkout: FC<ClientHubLatestWorkoutProps> = ({ error, loading, session, onRetry }) => {
  return (
    <ClientHubSection title='Последняя тренировка' type='latestWorkout'>
      {loading && <Loading className={cnClientHub('SessionsLoading')} visible />}
      {error !== undefined && (
        <div className={cnClientHub('SessionsError')}>
          <p>{error}</p>
          <Button color='secondary' onClick={onRetry} type='button'>
            Повторить
          </Button>
        </div>
      )}
      {!loading && error === undefined && session === null && (
        <ClientHubStubText>Завершённых тренировок пока нет</ClientHubStubText>
      )}
      {session !== null && (
        <div className={cnClientHub('LatestWorkout')}>
          <span className={cnClientHub('LatestWorkoutDate')}>
            {formatSessionTimestamp(session.completedAt ?? session.startedAt)}
          </span>
          <span className={cnClientHub('LatestWorkoutTag')}>{session.splitTag}</span>
          <span className={cnClientHub('LatestWorkoutStats')}>
            {formatWorkoutCount(session.exercises.length, 'упражнение', 'упражнения', 'упражнений')} ·{' '}
            {formatWorkoutCount(
              session.exercises.reduce((total, exercise) => total + exercise.sets.length, 0),
              'подход',
              'подхода',
              'подходов'
            )}
          </span>
          <Link className={cnClientHub('LatestWorkoutLink')} to={`/workouts/${session.clientId}/${session.id}`}>
            Открыть результат
          </Link>
        </div>
      )}
    </ClientHubSection>
  );
};
