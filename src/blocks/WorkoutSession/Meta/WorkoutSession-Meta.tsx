import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import type { Client } from '../../../services/clients/clients.models';
import { formatSessionTimestamp } from '../../../services/util/format/format';
import type { WorkoutSession as WorkoutSessionModel } from '../../../services/workoutSessions/workoutSessions.models';
import { WorkoutSessionClient } from '../Client/WorkoutSession-Client';
import { WorkoutSessionCompletedAt } from '../CompletedAt/WorkoutSession-CompletedAt';
import { WorkoutSessionMetaLabel } from '../MetaLabel/WorkoutSession-MetaLabel';
import { WorkoutSessionMetaRow } from '../MetaRow/WorkoutSession-MetaRow';
import { WorkoutSessionSplit } from '../Split/WorkoutSession-Split';
import { WorkoutSessionStartedAt } from '../StartedAt/WorkoutSession-StartedAt';
import { WorkoutSessionStatus } from '../Status/WorkoutSession-Status';

import './WorkoutSession-Meta.scss';

const cnWorkoutSessionMeta = cn('WorkoutSession', 'Meta');

type WorkoutSessionMetaProps = {
  readonly client: Client;
  readonly session: WorkoutSessionModel;
};

export const WorkoutSessionMeta: FC<WorkoutSessionMetaProps> = ({ client, session }) => {
  const isInProgress = session.status === 'in_progress';

  return (
    <section className={cnWorkoutSessionMeta()}>
      <WorkoutSessionMetaRow>
        <WorkoutSessionMetaLabel>Клиент</WorkoutSessionMetaLabel>
        <WorkoutSessionClient>{client.name}</WorkoutSessionClient>
      </WorkoutSessionMetaRow>
      <WorkoutSessionMetaRow>
        <WorkoutSessionMetaLabel>Тег</WorkoutSessionMetaLabel>
        <WorkoutSessionSplit>{session.splitTag}</WorkoutSessionSplit>
      </WorkoutSessionMetaRow>
      <WorkoutSessionMetaRow>
        <WorkoutSessionMetaLabel>Статус</WorkoutSessionMetaLabel>
        <WorkoutSessionStatus completed={session.status === 'completed'}>
          {isInProgress ? 'В процессе' : 'Завершена'}
        </WorkoutSessionStatus>
      </WorkoutSessionMetaRow>
      <WorkoutSessionMetaRow>
        <WorkoutSessionMetaLabel>Начало</WorkoutSessionMetaLabel>
        <WorkoutSessionStartedAt>{formatSessionTimestamp(session.startedAt)}</WorkoutSessionStartedAt>
      </WorkoutSessionMetaRow>
      {session.completedAt !== undefined && (
        <WorkoutSessionMetaRow>
          <WorkoutSessionMetaLabel>Завершение</WorkoutSessionMetaLabel>
          <WorkoutSessionCompletedAt>{formatSessionTimestamp(session.completedAt)}</WorkoutSessionCompletedAt>
        </WorkoutSessionMetaRow>
      )}
    </section>
  );
};
