import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-PlanOptions.scss';

const cnClientHubPlanOptions = cn('ClientHub', 'PlanOptions');

type ClientHubPlanOptionsProps = {
  readonly children: ReactNode;
};

export const ClientHubPlanOptions: FC<ClientHubPlanOptionsProps> = ({ children }) => {
  return <div className={cnClientHubPlanOptions()}>{children}</div>;
};
