import { type FC } from 'react';
import { cn } from '@bem-react/classname';
import { Link } from 'react-router-dom';

import type { WorkoutSession } from '../../../services/workoutSessions/workoutSessions.models';
import { Button } from '../../Button/Button';
import { Loading } from '../../Loading/Loading';
import { formatSessionTimestamp } from '../format';
import { ClientHubSection } from '../Section/ClientHub-Section';

import './ClientHub-ActiveWorkout.scss';

const cnClientHubActiveWorkout = cn('ClientHub', 'ActiveWorkout');
const cnClientHub = cn('ClientHub');

type ClientHubActiveWorkoutProps = {
  readonly loading: boolean;
  readonly session: WorkoutSession | null;
};

export const ClientHubActiveWorkout: FC<ClientHubActiveWorkoutProps> = ({ loading, session }) => {
  return (
    <ClientHubSection title='Тренировка в процессе' type='activeWorkout'>
      {loading && <Loading className={cnClientHub('SessionsLoading')} visible />}
      {session !== null && (
        <div className={cnClientHubActiveWorkout()}>
          <div className={cnClientHub('ActiveWorkoutInfo')}>
            <span className={cnClientHub('ActiveWorkoutTag')}>{session.splitTag}</span>
            <span className={cnClientHub('ActiveWorkoutTime')}>с {formatSessionTimestamp(session.startedAt)}</span>
          </div>
          <Button asChild className={cnClientHub('OpenWorkout')} color='primary'>
            <Link to={`/workouts/${session.clientId}/${session.id}`}>Открыть</Link>
          </Button>
        </div>
      )}
    </ClientHubSection>
  );
};
