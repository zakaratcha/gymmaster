import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';
import { Link } from 'react-router-dom';

import './ClientHub-LatestWorkoutLink.scss';

const cnClientHubLatestWorkoutLink = cn('ClientHub', 'LatestWorkoutLink');

type ClientHubLatestWorkoutLinkProps = {
  readonly children: ReactNode;
  readonly to: string;
};

export const ClientHubLatestWorkoutLink: FC<ClientHubLatestWorkoutLinkProps> = ({ children, to }) => {
  return (
    <Link className={cnClientHubLatestWorkoutLink()} to={to}>
      {children}
    </Link>
  );
};
