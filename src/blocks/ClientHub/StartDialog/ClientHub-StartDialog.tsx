import { type ChangeEvent, type FC, useCallback } from 'react';
import { cn } from '@bem-react/classname';

import type { PlannedWorkout } from '../../../services/plans/plans.models';
import { Button } from '../../Button/Button';
import { DialogActions } from '../../Dialog/Actions/Dialog-Actions';
import { DialogContent } from '../../Dialog/Content/Dialog-Content';
import { Dialog } from '../../Dialog/Dialog';
import { DialogTitle } from '../../Dialog/Title/Dialog-Title';
import { formatPlannedDate, formatWorkoutCount } from '../format';

import './ClientHub-StartDialog.scss';

const cnClientHub = cn('ClientHub');

type ClientHubStartDialogProps = {
  readonly error: string | undefined;
  readonly plans: readonly PlannedWorkout[];
  readonly selectedPlanId: string;
  readonly starting: boolean;
  onCancel(): void;
  onPlanChange(value: string): void;
  onStart(): void;
};

export const ClientHubStartDialog: FC<ClientHubStartDialogProps> = ({
  error,
  plans,
  selectedPlanId,
  starting,
  onCancel,
  onPlanChange,
  onStart
}) => {
  const handlePlanChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onPlanChange(event.currentTarget.value);
    },
    [onPlanChange]
  );

  return (
    <Dialog ariaLabel='Выбор плана тренировки' className={cnClientHub('StartDialog')} onCancel={onCancel}>
      <DialogTitle>Начать тренировку с плана</DialogTitle>
      <DialogContent>
        {error !== undefined && (
          <p className={cnClientHub('StartError')} role='alert'>
            {error}
          </p>
        )}
        <div className={cnClientHub('PlanOptions')}>
          {plans.map(plan => (
            <label className={cnClientHub('PlanOption', { selected: plan.id === selectedPlanId })} key={plan.id}>
              <input
                checked={plan.id === selectedPlanId}
                disabled={starting}
                name='planned-workout'
                onChange={handlePlanChange}
                type='radio'
                value={plan.id}
              />
              <span className={cnClientHub('PlanOptionText')}>
                <strong>
                  {formatPlannedDate(plan.plannedDate)} · {plan.splitTag}
                </strong>
                <span>{formatWorkoutCount(plan.exercises.length, 'упражнение', 'упражнения', 'упражнений')}</span>
              </span>
            </label>
          ))}
        </div>
      </DialogContent>
      <DialogActions>
        <Button disabled={starting} onClick={onCancel} type='button'>
          Отмена
        </Button>
        <Button color='primary' disabled={starting || selectedPlanId.length === 0} onClick={onStart} type='button'>
          {starting ? 'Запуск…' : 'Начать тренировку'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
