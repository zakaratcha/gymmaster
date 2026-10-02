import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';

import './ClientHub-DeleteConfirm.scss';

const cnClientHubDeleteConfirm = cn('ClientHub', 'DeleteConfirm');

type ClientHubDeleteConfirmProps = {
  readonly disabled: boolean;
  readonly submitting: boolean;
  onClick(): void;
};

export const ClientHubDeleteConfirm: FC<ClientHubDeleteConfirmProps> = ({ disabled, submitting, onClick }) => {
  return (
    <Button className={cnClientHubDeleteConfirm()} disabled={disabled} onClick={onClick} type='button'>
      {submitting ? 'Удаление…' : 'Удалить'}
    </Button>
  );
};
