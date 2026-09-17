import { type ChangeEvent, type FC, type SyntheticEvent, useCallback, useEffect, useRef } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Loading } from '../Loading/Loading';

import './ClientCreateForm.scss';

const cnClientCreateForm = cn('ClientCreateForm');

export type ClientCreateFormProps = {
  readonly name: string;
  readonly notes: string;
  readonly bodyWeightKg: string;
  readonly submitting: boolean;
  readonly error?: string;
  readonly mode?: 'create' | 'edit';
  onNameChange(value: string): void;
  onNotesChange(value: string): void;
  onBodyWeightKgChange(value: string): void;
  onSubmit(event: SyntheticEvent<HTMLFormElement>): void;
  onCancel(): void;
};

export const ClientCreateForm: FC<ClientCreateFormProps> = ({
  name,
  notes,
  bodyWeightKg,
  submitting,
  error,
  mode = 'create',
  onNameChange,
  onNotesChange,
  onBodyWeightKgChange,
  onSubmit,
  onCancel
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  const handleCancel = useCallback(
    (event: SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      if (!submitting) {
        onCancel();
      }
    },
    [onCancel, submitting]
  );

  const handleNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onNameChange(event.target.value);
    },
    [onNameChange]
  );

  const handleNotesChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      onNotesChange(event.target.value);
    },
    [onNotesChange]
  );

  const handleBodyWeightKgChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onBodyWeightKgChange(event.target.value);
    },
    [onBodyWeightKgChange]
  );

  return (
    <dialog
      aria-labelledby='client-form-title'
      className={cnClientCreateForm()}
      onCancel={handleCancel}
      ref={dialogRef}
    >
      <form className={cnClientCreateForm('Card')} onSubmit={onSubmit}>
        <Loading visible={submitting} />
        <h2 className={cnClientCreateForm('Title')} id='client-form-title'>
          {mode === 'edit' ? 'Редактирование клиента' : 'Новый клиент'}
        </h2>
        <Input
          className={cnClientCreateForm('NameField')}
          disabled={submitting}
          id='name'
          label='Имя'
          name='name'
          onChange={handleNameChange}
          placeholder='Введите имя'
          value={name}
        />
        <div className={cnClientCreateForm('NotesField')}>
          <label className={cnClientCreateForm('NotesLabel')} htmlFor='client-create-notes'>
            Заметки
          </label>
          <textarea
            className={cnClientCreateForm('NotesControl')}
            disabled={submitting}
            id='client-create-notes'
            name='notes'
            onChange={handleNotesChange}
            placeholder='Необязательно'
            rows={3}
            value={notes}
          />
        </div>
        <Input
          className={cnClientCreateForm('WeightField')}
          disabled={submitting}
          id='bodyWeightKg'
          label='Вес (кг)'
          name='bodyWeightKg'
          onChange={handleBodyWeightKgChange}
          placeholder='Необязательно'
          step='any'
          type='number'
          value={bodyWeightKg}
        />
        {error !== undefined && (
          <p className={cnClientCreateForm('Error')} role='alert'>
            {error}
          </p>
        )}
        <div className={cnClientCreateForm('Actions')}>
          <Button className={cnClientCreateForm('Cancel')} disabled={submitting} onClick={onCancel} type='button'>
            Отмена
          </Button>
          <Button className={cnClientCreateForm('Submit')} color='primary' disabled={submitting} type='submit'>
            {mode === 'edit' ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </form>
    </dialog>
  );
};
