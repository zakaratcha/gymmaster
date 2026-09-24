import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';

import './ClientHub-StubAction.scss';

const cnClientHubStubAction = cn('ClientHub', 'StubAction');

type ClientHubStubActionProps = {
  readonly disabled: boolean;
  onClick(): void;
};

export const ClientHubStubAction: FC<ClientHubStubActionProps> = ({ disabled, onClick }) => {
  return (
    <Button className={cnClientHubStubAction()} disabled={disabled} onClick={onClick} type='button'>
      Все планы
    </Button>
  );
};
