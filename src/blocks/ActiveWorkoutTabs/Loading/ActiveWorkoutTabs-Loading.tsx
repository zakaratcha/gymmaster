import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import './ActiveWorkoutTabs-Loading.scss';

const cnActiveWorkoutTabsLoading = cn('ActiveWorkoutTabs', 'Loading');

export const ActiveWorkoutTabsLoading: FC = () => {
  return (
    <div aria-busy='true' aria-live='polite' className={cnActiveWorkoutTabsLoading()}>
      <span />
      <span />
    </div>
  );
};
