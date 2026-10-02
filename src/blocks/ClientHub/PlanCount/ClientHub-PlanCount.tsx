import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-PlanCount.scss';

const cnClientHubPlanCount = cn('ClientHub', 'PlanCount');

type ClientHubPlanCountProps = {
  readonly children: ReactNode;
};

export const ClientHubPlanCount: FC<ClientHubPlanCountProps> = ({ children }) => {
  return <span className={cnClientHubPlanCount()}>{children}</span>;
};
