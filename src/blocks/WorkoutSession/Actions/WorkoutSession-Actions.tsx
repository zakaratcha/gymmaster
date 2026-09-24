import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';

import './WorkoutSession-Actions.scss';

const cnWorkoutSessionActions = cn('WorkoutSession', 'Actions');
const cnWorkoutSession = cn('WorkoutSession');

type WorkoutSessionActionsProps = {
  readonly completing: boolean;
  readonly disabled: boolean;
  readonly saving: boolean;
  onComplete(): void;
};

export const WorkoutSessionActions: FC<WorkoutSessionActionsProps> = ({ completing, disabled, saving, onComplete }) => {
  return (
    <div className={cnWorkoutSessionActions()}>
      <Button
        className={cnWorkoutSession('Save')}
        color='secondary'
        disabled={disabled}
        form='workout-session-form'
        type='submit'
      >
        {saving ? 'Сохранение…' : 'Сохранить факт'}
      </Button>
      <Button
        className={cnWorkoutSession('Complete')}
        color='primary'
        disabled={disabled}
        onClick={onComplete}
        type='button'
      >
        {completing ? 'Завершение…' : 'Завершить тренировку'}
      </Button>
    </div>
  );
};
