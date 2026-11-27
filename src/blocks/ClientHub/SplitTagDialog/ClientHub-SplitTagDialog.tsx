import { type ChangeEvent, type FC, type SyntheticEvent, useCallback } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../../Button/Button';
import { DialogActions } from '../../Dialog/Actions/Dialog-Actions';
import { DialogContent } from '../../Dialog/Content/Dialog-Content';
import { Dialog } from '../../Dialog/Dialog';
import { DialogTitle } from '../../Dialog/Title/Dialog-Title';
import { Input } from '../../Input/Input';

const cnClientHub = cn('ClientHub');

const FORM_ID = 'client-hub-split-tag-form';

type ClientHubSplitTagDialogProps = {
  readonly error: string | undefined;
  readonly submitting: boolean;
  readonly value: string;
  onCancel(): void;
  onChange(value: string): void;
  onSubmit(event: SyntheticEvent<HTMLFormElement>): void;
};

export const ClientHubSplitTagDialog: FC<ClientHubSplitTagDialogProps> = ({
  error,
  submitting,
  value,
  onCancel,
  onChange,
  onSubmit
}) => {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange]
  );

  return (
    <Dialog ariaLabel='Новый тег сплита' className={cnClientHub('SplitTagDialog')} onCancel={onCancel}>
      <DialogTitle>Новый тег</DialogTitle>
      <DialogContent>
        <form id={FORM_ID} noValidate onSubmit={onSubmit}>
          <Input
            disabled={submitting}
            error={error}
            id='client-hub-split-tag'
            label='Тег'
            onChange={handleChange}
            placeholder='ноги'
            value={value}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button disabled={submitting} onClick={onCancel} type='button'>
          Отмена
        </Button>
        <Button color='primary' disabled={submitting} form={FORM_ID} type='submit'>
          {submitting ? 'Сохранение…' : 'Добавить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
