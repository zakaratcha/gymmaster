import { type ChangeEvent, type FC, useCallback } from 'react';
import { cn } from '@bem-react/classname';

import type { PlannedWorkout } from '../../../services/plans/plans.models';
import { formatPlannedDate, formatWorkoutCount } from '../format';
import { ClientHubPlanOptionText } from '../PlanOptionText/ClientHub-PlanOptionText';

import './ClientHub-PlanOption.scss';

const cnClientHubPlanOption = cn('ClientHub', 'PlanOption');

type ClientHubPlanOptionProps = {
  readonly disabled: boolean;
  readonly plan: PlannedWorkout;
  readonly selected: boolean;
  onPlanChange(value: string): void;
};

export const ClientHubPlanOption: FC<ClientHubPlanOptionProps> = ({ disabled, plan, selected, onPlanChange }) => {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onPlanChange(event.currentTarget.value);
    },
    [onPlanChange]
  );

  return (
    <label className={cnClientHubPlanOption({ selected })}>
      <input
        checked={selected}
        disabled={disabled}
        name='planned-workout'
        onChange={handleChange}
        type='radio'
        value={plan.id}
      />
      <ClientHubPlanOptionText>
        <strong>
          {formatPlannedDate(plan.plannedDate)} · {plan.splitTag}
        </strong>
        <span>{formatWorkoutCount(plan.exercises.length, 'упражнение', 'упражнения', 'упражнений')}</span>
      </ClientHubPlanOptionText>
    </label>
  );
};
