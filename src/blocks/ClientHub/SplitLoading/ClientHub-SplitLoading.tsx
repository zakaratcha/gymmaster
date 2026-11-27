import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Loading } from '../../Loading/Loading';

import './ClientHub-SplitLoading.scss';

const cnClientHubSplitLoading = cn('ClientHub', 'SplitLoading');

export const ClientHubSplitLoading: FC = () => <Loading className={cnClientHubSplitLoading()} visible />;
