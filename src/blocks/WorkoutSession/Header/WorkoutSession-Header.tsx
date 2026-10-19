import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { WorkoutSessionBack } from '../Back/WorkoutSession-Back';
import { WorkoutSessionTitle } from '../Title/WorkoutSession-Title';

import './WorkoutSession-Header.scss';

const cnWorkoutSessionHeader = cn('WorkoutSession', 'Header');

type WorkoutSessionHeaderProps = {
  readonly backTo: string;
};

export const WorkoutSessionHeader: FC<WorkoutSessionHeaderProps> = ({ backTo }) => {
  return (
    <header className={cnWorkoutSessionHeader()}>
      <WorkoutSessionBack to={backTo} />
      <WorkoutSessionTitle />
    </header>
  );
};
