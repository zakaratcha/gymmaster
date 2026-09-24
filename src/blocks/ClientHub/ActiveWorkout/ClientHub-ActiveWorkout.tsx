import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import type { WorkoutSession } from '../../../services/workoutSessions/workoutSessions.models';
import { ClientHubActiveWorkoutInfo } from '../ActiveWorkoutInfo/ClientHub-ActiveWorkoutInfo';
import { ClientHubActiveWorkoutTag } from '../ActiveWorkoutTag/ClientHub-ActiveWorkoutTag';
import { ClientHubActiveWorkoutTime } from '../ActiveWorkoutTime/ClientHub-ActiveWorkoutTime';
import { formatSessionTimestamp } from '../format';
import { ClientHubOpenWorkout } from '../OpenWorkout/ClientHub-OpenWorkout';
import { ClientHubSection } from '../Section/ClientHub-Section';
import { ClientHubSessionsLoading } from '../SessionsLoading/ClientHub-SessionsLoading';

import './ClientHub-ActiveWorkout.scss';

const cnClientHubActiveWorkout = cn('ClientHub', 'ActiveWorkout');

type ClientHubActiveWorkoutProps = {
  readonly loading: boolean;
  readonly session: WorkoutSession | null;
};

export const ClientHubActiveWorkout: FC<ClientHubActiveWorkoutProps> = ({ loading, session }) => {
  return (
    <ClientHubSection title='Тренировка в процессе' type='activeWorkout'>
      {loading && <ClientHubSessionsLoading />}
      {session !== null && (
        <div className={cnClientHubActiveWorkout()}>
          <ClientHubActiveWorkoutInfo>
            <ClientHubActiveWorkoutTag>{session.splitTag}</ClientHubActiveWorkoutTag>
            <ClientHubActiveWorkoutTime>с {formatSessionTimestamp(session.startedAt)}</ClientHubActiveWorkoutTime>
          </ClientHubActiveWorkoutInfo>
          <ClientHubOpenWorkout clientId={session.clientId} sessionId={session.id} />
        </div>
      )}
    </ClientHubSection>
  );
};
