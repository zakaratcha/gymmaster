import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import type { WorkoutComparisonStatus as WorkoutComparisonStatusValue } from '../../../services/workoutSessions/workoutComparison.models';

import './WorkoutComparison-Status.scss';

const cnWorkoutComparisonStatus = cn('WorkoutComparison', 'Status');

const statusLabels: Record<WorkoutComparisonStatusValue, string> = {
  matched: 'совпадает',
  deviated: 'отличается',
  not_done: 'не выполнено',
  extra: 'вне плана'
};

type WorkoutComparisonStatusProps = {
  readonly status: WorkoutComparisonStatusValue;
};

export const WorkoutComparisonStatus: FC<WorkoutComparisonStatusProps> = ({ status }) => {
  return <span className={cnWorkoutComparisonStatus({ status })}>{statusLabels[status]}</span>;
};
