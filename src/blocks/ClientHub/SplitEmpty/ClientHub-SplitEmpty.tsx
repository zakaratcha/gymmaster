import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-SplitEmpty.scss';

const cnClientHubSplitEmpty = cn('ClientHub', 'SplitEmpty');

export const ClientHubSplitEmpty: FC = () => {
  return <span className={cnClientHubSplitEmpty()}>Тегов пока нет</span>;
};
