import { type FC, type ReactNode } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-PlanRow.scss';

const cnClientHubPlanRow = cn('ClientHub', 'PlanRow');

type ClientHubPlanRowProps = {
  readonly children: ReactNode;
};

export const ClientHubPlanRow: FC<ClientHubPlanRowProps> = ({ children }) => {
  return <div className={cnClientHubPlanRow()}>{children}</div>;
};
