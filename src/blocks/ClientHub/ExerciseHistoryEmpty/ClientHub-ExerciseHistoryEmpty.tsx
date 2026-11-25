import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-ExerciseHistoryEmpty.scss';

const cnClientHubExerciseHistoryEmpty = cn('ClientHub', 'ExerciseHistoryEmpty');

export const ClientHubExerciseHistoryEmpty: FC = () => {
  return <p className={cnClientHubExerciseHistoryEmpty()}>Справочник пуст</p>;
};
