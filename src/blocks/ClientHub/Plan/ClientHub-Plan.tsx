import { type FC } from 'react';

import type { PlannedWorkout } from '../../../services/plans/plans.models';
import { formatPlannedDate } from '../format';
import { ClientHubPlanCount } from '../PlanCount/ClientHub-PlanCount';
import { ClientHubPlanRow } from '../PlanRow/ClientHub-PlanRow';
import { ClientHubPlansError } from '../PlansError/ClientHub-PlansError';
import { ClientHubPlansLoading } from '../PlansLoading/ClientHub-PlansLoading';
import { ClientHubSection } from '../Section/ClientHub-Section';
import { ClientHubStubAction } from '../StubAction/ClientHub-StubAction';
import { ClientHubStubText } from '../StubText/ClientHub-StubText';

type ClientHubPlanProps = {
  readonly error: string | undefined;
  readonly loading: boolean;
  readonly plans: readonly PlannedWorkout[];
  readonly plansAvailable: boolean;
  onAllPlans(): void;
  onRetry(): void;
};

export const ClientHubPlan: FC<ClientHubPlanProps> = ({
  error,
  loading,
  plans,
  plansAvailable,
  onAllPlans,
  onRetry
}) => {
  const nearestPlan = plans[0];

  return (
    <ClientHubSection title='Ближайший план' type='plan'>
      {loading && <ClientHubPlansLoading />}
      {error !== undefined && <ClientHubPlansError error={error} onRetry={onRetry} />}
      {!loading && error === undefined && plans.length === 0 && (
        <ClientHubStubText>Нет предстоящих планов</ClientHubStubText>
      )}
      {!loading && error === undefined && nearestPlan !== undefined && (
        <ClientHubPlanRow>
          <span>
            {formatPlannedDate(nearestPlan.plannedDate)} · {nearestPlan.splitTag}
          </span>
          {plans.length > 1 && <ClientHubPlanCount>+ ещё {plans.length - 1}</ClientHubPlanCount>}
        </ClientHubPlanRow>
      )}
      <ClientHubStubAction disabled={!plansAvailable} onClick={onAllPlans} />
    </ClientHubSection>
  );
};
