import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Loading } from '../../Loading/Loading';

import './PreviousWorkoutComparison-Loading.scss';

const cnPreviousWorkoutComparisonLoading = cn('PreviousWorkoutComparison', 'Loading');

export const PreviousWorkoutComparisonLoading: FC = () => {
  return <Loading className={cnPreviousWorkoutComparisonLoading()} visible />;
};
