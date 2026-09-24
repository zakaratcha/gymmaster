import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { WorkoutSessionComplete } from '../Complete/WorkoutSession-Complete';
import { WorkoutSessionSave } from '../Save/WorkoutSession-Save';

import './WorkoutSession-Actions.scss';

const cnWorkoutSessionActions = cn('WorkoutSession', 'Actions');

type WorkoutSessionActionsProps = {
  readonly completing: boolean;
  readonly disabled: boolean;
  readonly saving: boolean;
  onComplete(): void;
};

export const WorkoutSessionActions: FC<WorkoutSessionActionsProps> = ({ completing, disabled, saving, onComplete }) => {
  return (
    <div className={cnWorkoutSessionActions()}>
      <WorkoutSessionSave disabled={disabled} saving={saving} />
      <WorkoutSessionComplete completing={completing} disabled={disabled} onClick={onComplete} />
    </div>
  );
};
