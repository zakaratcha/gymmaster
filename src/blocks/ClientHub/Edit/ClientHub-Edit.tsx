import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';

import './ClientHub-Edit.scss';

const cnClientHubEdit = cn('ClientHub', 'Edit');

type ClientHubEditProps = {
  readonly disabled: boolean;
  onClick(): void;
};

export const ClientHubEdit: FC<ClientHubEditProps> = ({ disabled, onClick }) => {
  return (
    <Button className={cnClientHubEdit()} color='ghost' disabled={disabled} onClick={onClick} size='s' type='button'>
      Править
    </Button>
  );
};
