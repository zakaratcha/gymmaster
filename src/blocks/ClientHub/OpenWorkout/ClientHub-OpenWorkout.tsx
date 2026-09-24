import { type FC } from 'react';
import { cn } from '@bem-react/classname';
import { Link } from 'react-router-dom';

import { Button } from '../../Button/Button';

import './ClientHub-OpenWorkout.scss';

const cnClientHubOpenWorkout = cn('ClientHub', 'OpenWorkout');

type ClientHubOpenWorkoutProps = {
  readonly clientId: string;
  readonly sessionId: string;
};

export const ClientHubOpenWorkout: FC<ClientHubOpenWorkoutProps> = ({ clientId, sessionId }) => {
  return (
    <Button asChild className={cnClientHubOpenWorkout()} color='primary'>
      <Link to={`/workouts/${clientId}/${sessionId}`}>Открыть</Link>
    </Button>
  );
};
