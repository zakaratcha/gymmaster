import { type FC } from 'react';
import { cn } from '@bem-react/classname';
import { Link } from 'react-router-dom';

import './PreviousWorkoutComparison-Header.scss';

const cnPreviousWorkoutComparisonHeader = cn('PreviousWorkoutComparison', 'Header');

type PreviousWorkoutComparisonHeaderProps = {
  readonly backTo: string;
  readonly splitTag?: string;
};

export const PreviousWorkoutComparisonHeader: FC<PreviousWorkoutComparisonHeaderProps> = ({ backTo, splitTag }) => {
  return (
    <header className={cnPreviousWorkoutComparisonHeader()}>
      <Link aria-label='Вернуться к тренировке' to={backTo}>
        ←
      </Link>
      {splitTag !== undefined && <h1>Сравнение: {splitTag}</h1>}
    </header>
  );
};
