import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import './ClientHub-Title.scss';

const cnClientHubTitle = cn('ClientHub', 'Title');

type ClientHubTitleProps = {
  readonly name: string | undefined;
};

export const ClientHubTitle: FC<ClientHubTitleProps> = ({ name }) => {
  return <h1 className={cnClientHubTitle()}>{name ?? 'Клиент'}</h1>;
};
