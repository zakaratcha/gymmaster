import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import './ExerciseHistory-Empty.scss';

const cnExerciseHistoryEmpty = cn('ExerciseHistory', 'Empty');

export const ExerciseHistoryEmpty: FC = () => {
  return <p className={cnExerciseHistoryEmpty()}>Нет завершённых тренировок с этим упражнением</p>;
};
