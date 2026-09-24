import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Loading } from '../../Loading/Loading';

import './ClientHub-PlansLoading.scss';

const cnClientHubPlansLoading = cn('ClientHub', 'PlansLoading');

export const ClientHubPlansLoading: FC = () => <Loading className={cnClientHubPlansLoading()} visible />;
