import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';

import './ClientHub-Delete.scss';

const cnClientHub = cn('ClientHub');

type ClientHubDeleteProps = {
  onClick(): void;
};

export const ClientHubDelete: FC<ClientHubDeleteProps> = ({ onClick }) => {
  return (
    <Button className={cnClientHub('Delete')} onClick={onClick} type='button'>
      Удалить клиента
    </Button>
  );
};
