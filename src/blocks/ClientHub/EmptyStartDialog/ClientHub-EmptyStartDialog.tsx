import { type FC, type SyntheticEvent } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';
import { DialogActions } from '../../Dialog/Actions/Dialog-Actions';
import { DialogContent } from '../../Dialog/Content/Dialog-Content';
import { Dialog } from '../../Dialog/Dialog';
import { DialogTitle } from '../../Dialog/Title/Dialog-Title';
import { SplitTagField } from '../../SplitTagField/SplitTagField';
import { ClientHubStartError } from '../StartError/ClientHub-StartError';

const cnClientHub = cn('ClientHub');

const FORM_ID = 'client-hub-empty-start-form';

type ClientHubEmptyStartDialogProps = {
  readonly error: string | undefined;
  readonly starting: boolean;
  readonly tags: readonly string[];
  readonly value: string;
  onCancel(): void;
  onChange(value: string): void;
  onSubmit(event: SyntheticEvent<HTMLFormElement>): void;
};

export const ClientHubEmptyStartDialog: FC<ClientHubEmptyStartDialogProps> = ({
  error,
  starting,
  tags,
  value,
  onCancel,
  onChange,
  onSubmit
}) => {
  return (
    <Dialog ariaLabel='Пустая сессия' className={cnClientHub('EmptyStartDialog')} onCancel={onCancel}>
      <DialogTitle>Пустая сессия</DialogTitle>
      <DialogContent>
        {error !== undefined && <ClientHubStartError>{error}</ClientHubStartError>}
        <form id={FORM_ID} noValidate onSubmit={onSubmit}>
          <SplitTagField
            disabled={starting}
            id='client-hub-empty-start-tag'
            label='Тег дня'
            placeholder='ноги'
            tags={tags}
            value={value}
            onChange={onChange}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button disabled={starting} onClick={onCancel} type='button'>
          Отмена
        </Button>
        <Button color='primary' disabled={starting} form={FORM_ID} type='submit'>
          {starting ? 'Запуск…' : 'Начать тренировку'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
