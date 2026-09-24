import { type FC, type ReactNode, type SyntheticEvent } from 'react';
import { cn } from '@bem-react/classname';

import { WorkoutSessionFormError } from '../FormError/WorkoutSession-FormError';
import { WorkoutSessionSuccess } from '../Success/WorkoutSession-Success';

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
      {formError !== undefined && <WorkoutSessionFormError>{formError}</WorkoutSessionFormError>}
      {saveSuccess && <WorkoutSessionSuccess>Факт сохранён</WorkoutSessionSuccess>}
      {actions}
    </form>
  );
};
