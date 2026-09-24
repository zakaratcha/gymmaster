import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';

import './ClientHub-DeleteCancel.scss';

const cnClientHubDeleteCancel = cn('ClientHub', 'DeleteCancel');

type ClientHubDeleteCancelProps = {
  readonly disabled: boolean;
  onClick(): void;
};

export const ClientHubDeleteCancel: FC<ClientHubDeleteCancelProps> = ({ disabled, onClick }) => {
  return (
    <Button className={cnClientHubDeleteCancel()} disabled={disabled} onClick={onClick} type='button'>
      Отмена
    </Button>
  );
};
