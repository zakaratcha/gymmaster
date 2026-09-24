import { type FC, type RefObject, type SyntheticEvent, useCallback } from 'react';
import { cn } from '@bem-react/classname';

import type { Client } from '../../../services/clients/clients.models';
import { Button } from '../../Button/Button';
import { ClientHubActionRow } from '../ActionRow/ClientHub-ActionRow';

import './ClientHub-DeleteDialog.scss';

const cnClientHub = cn('ClientHub');

type ClientHubDeleteDialogProps = {
  readonly client: Client | undefined;
  readonly dialogRef: RefObject<HTMLDialogElement | null>;
  readonly error: string | undefined;
  readonly submitting: boolean;
  onCancel(): void;
  onConfirm(): void;
};

export const ClientHubDeleteDialog: FC<ClientHubDeleteDialogProps> = ({
  client,
  dialogRef,
  error,
  submitting,
  onCancel,
  onConfirm
}) => {
  const handleCancel = useCallback(
    (event: SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      onCancel();
    },
    [onCancel]
  );

  return (
    <dialog
      aria-describedby='client-delete-description'
      aria-labelledby='client-delete-title'
      className={cnClientHub('DeleteDialog')}
      onCancel={handleCancel}
      ref={dialogRef}
    >
      <h2 id='client-delete-title'>Удалить клиента?</h2>
      <p id='client-delete-description'>Клиент «{client?.name}» будет удалён. Это действие нельзя отменить.</p>
      {error !== undefined && (
        <p className={cnClientHub('DeleteError')} role='alert'>
          {error}
        </p>
      )}
      <ClientHubActionRow>
        <Button className={cnClientHub('DeleteCancel')} disabled={submitting} onClick={onCancel} type='button'>
          Отмена
        </Button>
        <Button className={cnClientHub('DeleteConfirm')} disabled={submitting} onClick={onConfirm} type='button'>
          {submitting ? 'Удаление…' : 'Удалить'}
        </Button>
      </ClientHubActionRow>
    </dialog>
  );
};
