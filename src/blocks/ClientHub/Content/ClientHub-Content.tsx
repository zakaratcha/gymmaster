import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import type { Client } from '../../../services/clients/clients.models';
import type { PlannedWorkout } from '../../../services/plans/plans.models';
import type { WorkoutSession } from '../../../services/workoutSessions/workoutSessions.models';
import { ClientHubActions } from '../Actions/ClientHub-Actions';
import { ClientHubActiveWorkout } from '../ActiveWorkout/ClientHub-ActiveWorkout';
import { ClientHubBodyWeight } from '../BodyWeight/ClientHub-BodyWeight';
import { ClientHubDelete } from '../Delete/ClientHub-Delete';
import { ClientHubErrorBlock } from '../ErrorBlock/ClientHub-ErrorBlock';
import { ClientHubHistory } from '../History/ClientHub-History';
import { ClientHubLatestWorkout } from '../LatestWorkout/ClientHub-LatestWorkout';
import { ClientHubLoading } from '../Loading/ClientHub-Loading';
import { ClientHubNotes } from '../Notes/ClientHub-Notes';
import { ClientHubPlan } from '../Plan/ClientHub-Plan';
import { ClientHubSplit } from '../Split/ClientHub-Split';

import './ClientHub-Content.scss';

const cnClientHubContent = cn('ClientHub', 'Content');

type ClientHubContentProps = {
  readonly activeSession: WorkoutSession | null;
  readonly client: Client | undefined;
  readonly error: string | undefined;
  readonly id: string | undefined;
  readonly latestCompletedSession: WorkoutSession | null;
  readonly loading: boolean;
  readonly notesExpanded: boolean;
  readonly plans: readonly PlannedWorkout[];
  readonly plansError: string | undefined;
  readonly plansLoading: boolean;
  readonly sessionsError: string | undefined;
  readonly sessionsLoading: boolean;
  readonly splitTags: readonly string[];
  readonly splitTagsError: string | undefined;
  readonly splitTagsLoading: boolean;
  readonly staticMode: boolean;
  onAllPlans(): void;
  onDelete(): void;
  onEmptyStartOpen(): void;
  onHistoryOpen(): void;
  onPlansRetry(): void;
  onRetry(): void;
  onSessionsRetry(): void;
  onSplitTagAdd(): void;
  onSplitTagsRetry(): void;
  onStartOpen(): void;
  onToggleNotes(): void;
};

export const ClientHubContent: FC<ClientHubContentProps> = ({
  activeSession,
  client,
  error,
  id,
  latestCompletedSession,
  loading,
  notesExpanded,
  plans,
  plansError,
  plansLoading,
  sessionsError,
  sessionsLoading,
  splitTags,
  splitTagsError,
  splitTagsLoading,
  staticMode,
  onAllPlans,
  onDelete,
  onEmptyStartOpen,
  onHistoryOpen,
  onPlansRetry,
  onRetry,
  onSessionsRetry,
  onSplitTagAdd,
  onSplitTagsRetry,
  onStartOpen,
  onToggleNotes
}) => {
  const notes = client?.notes?.trim() ?? '';
  const emptyStartDisabled =
    id === undefined || staticMode || activeSession !== null || sessionsLoading || sessionsError !== undefined;
  const startDisabled = emptyStartDisabled || plansLoading || plansError !== undefined || plans.length === 0;

  return (
    <div className={cnClientHubContent()}>
      {loading && <ClientHubLoading />}

      {error !== undefined && <ClientHubErrorBlock error={error} onRetry={onRetry} />}

      {!loading && error === undefined && client !== undefined && (
        <>
          <ClientHubNotes expanded={notesExpanded} notes={notes} onToggle={onToggleNotes} />
          <ClientHubBodyWeight client={client} />
          {(sessionsLoading || activeSession !== null) && (
            <ClientHubActiveWorkout loading={sessionsLoading} session={activeSession} />
          )}
          <ClientHubPlan
            error={plansError}
            loading={plansLoading}
            plans={plans}
            plansAvailable={id !== undefined}
            onAllPlans={onAllPlans}
            onRetry={onPlansRetry}
          />
          <ClientHubActions
            active={activeSession !== null}
            emptyStartDisabled={emptyStartDisabled}
            startDisabled={startDisabled}
            onEmptyStart={onEmptyStartOpen}
            onStart={onStartOpen}
          />
          <ClientHubLatestWorkout
            error={sessionsError}
            loading={sessionsLoading}
            session={latestCompletedSession}
            onRetry={onSessionsRetry}
          />
          <ClientHubHistory onOpen={onHistoryOpen} />
          <ClientHubSplit
            addDisabled={id === undefined || staticMode || splitTagsLoading}
            error={splitTagsError}
            loading={splitTagsLoading}
            tags={splitTags}
            onAdd={onSplitTagAdd}
            onRetry={onSplitTagsRetry}
          />
        </>
      )}
      {!loading && client !== undefined && <ClientHubDelete onClick={onDelete} />}
    </div>
  );
};
