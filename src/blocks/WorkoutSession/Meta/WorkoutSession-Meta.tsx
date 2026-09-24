import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import type { Client } from '../../../services/clients/clients.models';
import type { WorkoutSession as WorkoutSessionModel } from '../../../services/workoutSessions/workoutSessions.models';

import './WorkoutSession-Meta.scss';

const cnWorkoutSessionMeta = cn('WorkoutSession', 'Meta');
const cnWorkoutSession = cn('WorkoutSession');

const timestampFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

function formatTimestamp(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : timestampFormatter.format(date);
}

type WorkoutSessionMetaProps = {
  readonly client: Client;
  readonly session: WorkoutSessionModel;
};

export const WorkoutSessionMeta: FC<WorkoutSessionMetaProps> = ({ client, session }) => {
  const isInProgress = session.status === 'in_progress';

  return (
    <section className={cnWorkoutSessionMeta()}>
      <div className={cnWorkoutSession('MetaRow')}>
        <span className={cnWorkoutSession('MetaLabel')}>Клиент</span>
        <span className={cnWorkoutSession('Client')}>{client.name}</span>
      </div>
      <div className={cnWorkoutSession('MetaRow')}>
        <span className={cnWorkoutSession('MetaLabel')}>Тег</span>
        <span className={cnWorkoutSession('Split')}>{session.splitTag}</span>
      </div>
      <div className={cnWorkoutSession('MetaRow')}>
        <span className={cnWorkoutSession('MetaLabel')}>Статус</span>
        <span className={cnWorkoutSession('Status', { completed: session.status === 'completed' })}>
          {isInProgress ? 'В процессе' : 'Завершена'}
        </span>
      </div>
      <div className={cnWorkoutSession('MetaRow')}>
        <span className={cnWorkoutSession('MetaLabel')}>Начало</span>
        <span className={cnWorkoutSession('StartedAt')}>{formatTimestamp(session.startedAt)}</span>
      </div>
      {session.completedAt !== undefined && (
        <div className={cnWorkoutSession('MetaRow')}>
          <span className={cnWorkoutSession('MetaLabel')}>Завершение</span>
          <span className={cnWorkoutSession('CompletedAt')}>{formatTimestamp(session.completedAt)}</span>
        </div>
      )}
    </section>
  );
};
