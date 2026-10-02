import { type FC, useCallback } from 'react';
import { cn } from '@bem-react/classname';

import type { PlannedWorkout } from '../../../services/plans/plans.models';
import { formatPlannedDate, formatWorkoutCount } from '../../../services/util/format/format';
import { Radio } from '../../Radio/Radio';
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
    (value: string) => {
      onPlanChange(value);
    },
    [onPlanChange]
  );

  return (
    <Radio
      checked={selected}
      className={cnClientHubPlanOption({ selected })}
      disabled={disabled}
      name='planned-workout'
      onChange={handleChange}
      value={plan.id}
    >
      <ClientHubPlanOptionText>
        <strong>
          {formatPlannedDate(plan.plannedDate)} · {plan.splitTag}
        </strong>
        <span>{formatWorkoutCount(plan.exercises.length, 'упражнение', 'упражнения', 'упражнений')}</span>
      </ClientHubPlanOptionText>
    </Radio>
  );
};
