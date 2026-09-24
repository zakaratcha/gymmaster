import { type FC, useCallback } from 'react';
import { cn } from '@bem-react/classname';

import type { PlannedWorkout } from '../../../services/plans/plans.models';
import { Button } from '../../Button/Button';
import { DialogActions } from '../../Dialog/Actions/Dialog-Actions';
import { DialogContent } from '../../Dialog/Content/Dialog-Content';
import { Dialog } from '../../Dialog/Dialog';
import { DialogTitle } from '../../Dialog/Title/Dialog-Title';
import { ClientHubPlanOption } from '../PlanOption/ClientHub-PlanOption';
import { ClientHubPlanOptions } from '../PlanOptions/ClientHub-PlanOptions';
import { ClientHubStartError } from '../StartError/ClientHub-StartError';

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
    (value: string) => {
      onPlanChange(value);
    },
    [onPlanChange]
  );

  return (
    <Dialog ariaLabel='Выбор плана тренировки' className={cnClientHub('StartDialog')} onCancel={onCancel}>
      <DialogTitle>Начать тренировку с плана</DialogTitle>
      <DialogContent>
        {error !== undefined && <ClientHubStartError>{error}</ClientHubStartError>}
        <ClientHubPlanOptions>
          {plans.map(plan => (
            <ClientHubPlanOption
              disabled={starting}
              key={plan.id}
              plan={plan}
              selected={plan.id === selectedPlanId}
              onPlanChange={handlePlanChange}
            />
          ))}
        </ClientHubPlanOptions>
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
