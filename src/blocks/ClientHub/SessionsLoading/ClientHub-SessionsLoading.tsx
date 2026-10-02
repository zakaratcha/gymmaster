import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Loading } from '../../Loading/Loading';

import './ClientHub-SessionsLoading.scss';

const cnClientHubSessionsLoading = cn('ClientHub', 'SessionsLoading');

export const ClientHubSessionsLoading: FC = () => <Loading className={cnClientHubSessionsLoading()} visible />;
