import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Loading } from '../../Loading/Loading';

import './ClientHub-ExerciseHistoryLoading.scss';

const cnClientHubExerciseHistoryLoading = cn('ClientHub', 'ExerciseHistoryLoading');

export const ClientHubExerciseHistoryLoading: FC = () => {
  return (
    <div className={cnClientHubExerciseHistoryLoading()}>
      <Loading visible />
    </div>
  );
};
