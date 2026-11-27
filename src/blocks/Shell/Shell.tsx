import { cn } from '@bem-react/classname';
import { DotsHorizontalIcon, LightningBoltIcon, PersonIcon } from '@radix-ui/react-icons';
import type { FC } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import './Shell.scss';

const cnShell = cn('Shell');

const tabs = [
  { to: '/clients', label: 'Клиенты', tab: 'clients', Icon: PersonIcon },
  { to: '/exercises', label: 'Упражнения', tab: 'exercises', Icon: LightningBoltIcon },
  { to: '/account', label: 'Ещё', tab: 'account', Icon: DotsHorizontalIcon }
] as const;

type NavTab = (typeof tabs)[number]['tab'];

function createNavItemClassName(tab: NavTab) {
  return ({ isActive }: { isActive: boolean }) => cnShell('NavItem', { tab, active: isActive });
}

export const Shell: FC = () => {
  return (
    <div className={cnShell()}>
      <div className={cnShell('Content')}>
        <Outlet />
      </div>
      <nav className={cnShell('BottomNav')}>
        {tabs.map(({ to, label, tab, Icon }) => (
          <NavLink key={to} className={createNavItemClassName(tab)} to={to}>
            <Icon aria-hidden='true' className={cnShell('NavIcon')} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
