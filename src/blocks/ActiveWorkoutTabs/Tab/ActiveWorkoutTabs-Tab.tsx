import { type FC } from 'react';
import { cn } from '@bem-react/classname';
import { NavLink } from 'react-router-dom';

import './ActiveWorkoutTabs-Tab.scss';

const cnActiveWorkoutTabsTab = cn('ActiveWorkoutTabs', 'Tab');

type ActiveWorkoutTabsTabProps = {
  readonly label: string;
  readonly to: string;
};

function createClassName({ isActive }: { isActive: boolean }): string {
  return cnActiveWorkoutTabsTab({ active: isActive });
}

export const ActiveWorkoutTabsTab: FC<ActiveWorkoutTabsTabProps> = ({ label, to }) => {
  return (
    <NavLink className={createClassName} to={to}>
      {label}
    </NavLink>
  );
};
