import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Loading } from '../../Loading/Loading';

import './ExerciseHistory-Loading.scss';

const cnExerciseHistoryLoading = cn('ExerciseHistory', 'Loading');

export const ExerciseHistoryLoading: FC = () => {
  return (
    <div className={cnExerciseHistoryLoading()}>
      <Loading visible />
    </div>
  );
};
