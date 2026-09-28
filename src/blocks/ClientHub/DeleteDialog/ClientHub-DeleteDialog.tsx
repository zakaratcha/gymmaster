import { type FC } from 'react';
import { cn } from '@bem-react/classname';

import type { Client } from '../../../services/clients/clients.models';
import { DialogActions } from '../../Dialog/Actions/Dialog-Actions';
import { DialogContent } from '../../Dialog/Content/Dialog-Content';
import { Dialog } from '../../Dialog/Dialog';
import { DialogTitle } from '../../Dialog/Title/Dialog-Title';
import { ClientHubDeleteCancel } from '../DeleteCancel/ClientHub-DeleteCancel';
import { ClientHubDeleteConfirm } from '../DeleteConfirm/ClientHub-DeleteConfirm';
import { ClientHubDeleteError } from '../DeleteError/ClientHub-DeleteError';

import './ClientHub-DeleteDialog.scss';

const cnClientHub = cn('ClientHub');

type ClientHubDeleteDialogProps = {
  readonly client: Client | undefined;
  readonly error: string | undefined;
  readonly submitting: boolean;
  onCancel(): void;
  onConfirm(): void;
};

export const ClientHubDeleteDialog: FC<ClientHubDeleteDialogProps> = ({
  client,
  error,
  submitting,
  onCancel,
  onConfirm
}) => {
  return (
    <Dialog ariaLabel='Удаление клиента' className={cnClientHub('DeleteDialog')} onCancel={onCancel}>
      <DialogTitle>Удалить клиента?</DialogTitle>
      <DialogContent>
        <p>Клиент «{client?.name}» будет удалён. Это действие нельзя отменить.</p>
        {error !== undefined && <ClientHubDeleteError error={error} />}
      </DialogContent>
      <DialogActions>
        <ClientHubDeleteCancel disabled={submitting} onClick={onCancel} />
        <ClientHubDeleteConfirm disabled={submitting} submitting={submitting} onClick={onConfirm} />
      </DialogActions>
    </Dialog>
  );
};
