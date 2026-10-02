import { type FC, type ReactNode, type SyntheticEvent } from 'react';
import { cn } from '@bem-react/classname';

import { WorkoutSessionError } from '../Error/WorkoutSession-Error';
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
    <form className={cnWorkoutSessionForm()} noValidate onSubmit={onSubmit}>
      {children}
      {formError !== undefined && <WorkoutSessionError error={formError} />}
      {saveSuccess && <WorkoutSessionSuccess>Факт сохранён</WorkoutSessionSuccess>}
      {actions}
    </form>
  );
};
