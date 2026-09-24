import { type FC, type ReactNode, type SyntheticEvent } from 'react';
import { cn } from '@bem-react/classname';

import './WorkoutSession-Form.scss';

const cnWorkoutSessionForm = cn('WorkoutSession', 'Form');

type WorkoutSessionFormProps = {
  readonly actions: ReactNode;
  readonly children: ReactNode;
  readonly formError: string | undefined;
  readonly saveSuccess: boolean;
  onSubmit(event: SyntheticEvent<HTMLFormElement>): void;
};

export const WorkoutSessionForm: FC<WorkoutSessionFormProps> = ({
  actions,
  children,
  formError,
  saveSuccess,
  onSubmit
}) => {
  return (
    <form className={cnWorkoutSessionForm()} id='workout-session-form' onSubmit={onSubmit}>
      {children}
      {formError !== undefined && (
        <p className={cn('WorkoutSession')('FormError')} role='alert'>
          {formError}
        </p>
      )}
      {saveSuccess && (
        <p className={cn('WorkoutSession')('Success')} role='status'>
          Факт сохранён
        </p>
      )}
      {actions}
    </form>
  );
};
