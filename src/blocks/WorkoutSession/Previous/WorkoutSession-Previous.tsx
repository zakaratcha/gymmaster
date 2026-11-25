import { type FC } from 'react';
import { cn } from '@bem-react/classname';
import { Link } from 'react-router-dom';

import { formatSessionDate } from '../../../services/util/format.utils';
import type { WorkoutSession } from '../../../services/workoutSessions/workoutSessions.models';

import './WorkoutSession-Previous.scss';

const cnWorkoutSessionPrevious = cn('WorkoutSession', 'Previous');

type WorkoutSessionPreviousProps = {
  readonly clientId: string;
  readonly sessionId: string;
  readonly previous: WorkoutSession;
};

export const WorkoutSessionPrevious: FC<WorkoutSessionPreviousProps> = ({ clientId, sessionId, previous }) => {
  const date = formatSessionDate(previous.completedAt ?? '');
  const to = `/workouts/${encodeURIComponent(clientId)}/${encodeURIComponent(sessionId)}/previous`;

  return (
    <section className={cnWorkoutSessionPrevious()}>
      <p>
        С прошлой „{previous.splitTag}“ ({date})
      </p>
      <Link to={to}>Подробнее</Link>
    </section>
  );
};
