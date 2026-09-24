import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Loading } from '../../Loading/Loading';

import './WorkoutSession-Loading.scss';

const cnWorkoutSessionLoading = cn('WorkoutSession', 'Loading');

export const WorkoutSessionLoading: FC = () => {
  return <Loading className={cnWorkoutSessionLoading()} visible />;
};
