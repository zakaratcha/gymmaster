import { type FC, useCallback } from 'react';
import { cn } from '@bem-react/classname';
import { NavLink } from 'react-router-dom';

import './ActiveWorkoutTabs-Tab.scss';

const cnActiveWorkoutTabsTab = cn('ActiveWorkoutTabs', 'Tab');

type ActiveWorkoutTabsTabProps = {
  readonly label: string;
  readonly to: string;
  readonly live?: boolean;
};

export const ActiveWorkoutTabsTab: FC<ActiveWorkoutTabsTabProps> = ({ label, to, live = false }) => {
  const createClassName = useCallback(
    ({ isActive }: { isActive: boolean }) => cnActiveWorkoutTabsTab({ active: isActive, live }),
    [live]
  );

  return (
    <NavLink className={createClassName} to={to}>
      {label}
    </NavLink>
  );
};
