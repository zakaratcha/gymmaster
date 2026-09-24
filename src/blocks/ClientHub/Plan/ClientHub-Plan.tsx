import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import type { PlannedWorkout } from '../../../services/plans/plans.models';
import { Button } from '../../Button/Button';
import { Loading } from '../../Loading/Loading';
import { formatPlannedDate } from '../format';
import { ClientHubSection } from '../Section/ClientHub-Section';
import { ClientHubStubText } from '../StubText/ClientHub-StubText';

import './ClientHub-Plan.scss';

const cnClientHub = cn('ClientHub');

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
      {loading && <Loading className={cnClientHub('PlansLoading')} visible />}
      {error !== undefined && (
        <div className={cnClientHub('PlansError')}>
          <p>{error}</p>
          <Button color='secondary' onClick={onRetry} type='button'>
            Повторить
          </Button>
        </div>
      )}
      {!loading && error === undefined && plans.length === 0 && (
        <ClientHubStubText>Нет предстоящих планов</ClientHubStubText>
      )}
      {!loading && error === undefined && nearestPlan !== undefined && (
        <div className={cnClientHub('PlanRow')}>
          <span>
            {formatPlannedDate(nearestPlan.plannedDate)} · {nearestPlan.splitTag}
          </span>
          {plans.length > 1 && <span className={cnClientHub('PlanCount')}>+ ещё {plans.length - 1}</span>}
        </div>
      )}
      <Button className={cnClientHub('StubAction')} disabled={!plansAvailable} onClick={onAllPlans} type='button'>
        Все планы
      </Button>
    </ClientHubSection>
  );
};
