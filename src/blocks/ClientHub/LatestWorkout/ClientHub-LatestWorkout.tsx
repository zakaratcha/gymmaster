import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { formatSessionTimestamp, formatWorkoutCount } from '../../../services/util/format/format';
import type { WorkoutSession } from '../../../services/workoutSessions/workoutSessions.models';
import { ClientHubLatestWorkoutContent } from '../LatestWorkoutContent/ClientHub-LatestWorkoutContent';
import { ClientHubLatestWorkoutDate } from '../LatestWorkoutDate/ClientHub-LatestWorkoutDate';
import { ClientHubLatestWorkoutLink } from '../LatestWorkoutLink/ClientHub-LatestWorkoutLink';
import { ClientHubLatestWorkoutStats } from '../LatestWorkoutStats/ClientHub-LatestWorkoutStats';
import { ClientHubLatestWorkoutTag } from '../LatestWorkoutTag/ClientHub-LatestWorkoutTag';
import { ClientHubSection } from '../Section/ClientHub-Section';
import { ClientHubSessionsError } from '../SessionsError/ClientHub-SessionsError';
import { ClientHubSessionsLoading } from '../SessionsLoading/ClientHub-SessionsLoading';
import { ClientHubStubText } from '../StubText/ClientHub-StubText';

const cnClientHubLatestWorkout = cn('ClientHub', 'LatestWorkout');

type ClientHubLatestWorkoutProps = {
  readonly error: string | undefined;
  readonly loading: boolean;
  readonly session: WorkoutSession | null;
  onRetry(): void;
};

export const ClientHubLatestWorkout: FC<ClientHubLatestWorkoutProps> = ({ error, loading, session, onRetry }) => {
  return (
    <ClientHubSection className={cnClientHubLatestWorkout()} title='Последняя тренировка' type='latestWorkout'>
      {loading && <ClientHubSessionsLoading />}
      {error !== undefined && <ClientHubSessionsError error={error} onRetry={onRetry} />}
      {!loading && error === undefined && session === null && (
        <ClientHubStubText>Завершённых тренировок пока нет</ClientHubStubText>
      )}
      {!loading && error === undefined && session !== null && (
        <ClientHubLatestWorkoutContent>
          <ClientHubLatestWorkoutDate>
            {formatSessionTimestamp(session.completedAt ?? session.startedAt)}
          </ClientHubLatestWorkoutDate>
          <ClientHubLatestWorkoutTag>{session.splitTag}</ClientHubLatestWorkoutTag>
          <ClientHubLatestWorkoutStats>
            {formatWorkoutCount(session.exercises.length, 'упражнение', 'упражнения', 'упражнений')} ·{' '}
            {formatWorkoutCount(
              session.exercises.reduce((total, exercise) => total + exercise.sets.length, 0),
              'подход',
              'подхода',
              'подходов'
            )}
          </ClientHubLatestWorkoutStats>
          <ClientHubLatestWorkoutLink to={`/workouts/${session.clientId}/${session.id}`}>
            Открыть результат
          </ClientHubLatestWorkoutLink>
        </ClientHubLatestWorkoutContent>
      )}
    </ClientHubSection>
  );
};
