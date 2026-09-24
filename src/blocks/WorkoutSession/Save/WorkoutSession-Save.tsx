import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';

import './WorkoutSession-Save.scss';

const cnWorkoutSessionSave = cn('WorkoutSession', 'Save');

type WorkoutSessionSaveProps = {
  readonly disabled: boolean;
  readonly saving: boolean;
};

export const WorkoutSessionSave: FC<WorkoutSessionSaveProps> = ({ disabled, saving }) => {
  return (
    <Button
      className={cnWorkoutSessionSave()}
      color='secondary'
      disabled={disabled}
      form='workout-session-form'
      type='submit'
    >
      {saving ? 'Сохранение…' : 'Сохранить факт'}
    </Button>
  );
};
