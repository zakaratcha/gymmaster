import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Loading } from '../../Loading/Loading';

import './ClientHub-Loading.scss';

const cnClientHub = cn('ClientHub');

export const ClientHubLoading: FC = () => <Loading className={cnClientHub('Loading')} visible />;
