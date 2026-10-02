import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { WorkoutSessionBack } from '../Back/WorkoutSession-Back';
import { WorkoutSessionTitle } from '../Title/WorkoutSession-Title';

import './WorkoutSession-Header.scss';

const cnWorkoutSessionHeader = cn('WorkoutSession', 'Header');

type WorkoutSessionHeaderProps = {
  readonly clientId: string | undefined;
};

export const WorkoutSessionHeader: FC<WorkoutSessionHeaderProps> = ({ clientId }) => {
  return (
    <header className={cnWorkoutSessionHeader()}>
      <WorkoutSessionBack clientId={clientId} />
      <WorkoutSessionTitle />
    </header>
  );
};
