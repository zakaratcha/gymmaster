import { type ChangeEvent, type FC, type SyntheticEvent, useCallback } from 'react';
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
  onNameChange,
  onNotesChange,
  onBodyWeightKgChange,
  onSubmit,
  onCancel
}) => {
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
    <div className={cnClientCreateForm()}>
      <button
        aria-label='Закрыть'
        className={cnClientCreateForm('Backdrop')}
        disabled={submitting}
        onClick={onCancel}
        type='button'
      />
      <form className={cnClientCreateForm('Card')} onSubmit={onSubmit}>
        <Loading visible={submitting} />
        <h2 className={cnClientCreateForm('Title')}>Новый клиент</h2>
        <Input
          className={cnClientCreateForm('NameField')}
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
          id='bodyWeightKg'
          label='Вес (кг)'
          name='bodyWeightKg'
          onChange={handleBodyWeightKgChange}
          placeholder='Необязательно'
          type='number'
          value={bodyWeightKg}
        />
        {error === undefined ? null : (
          <p className={cnClientCreateForm('Error')} role='alert'>
            {error}
          </p>
        )}
        <div className={cnClientCreateForm('Actions')}>
          <Button className={cnClientCreateForm('Cancel')} disabled={submitting} onClick={onCancel} type='button'>
            Отмена
          </Button>
          <Button className={cnClientCreateForm('Submit')} color='primary' disabled={submitting} type='submit'>
            Создать
          </Button>
        </div>
      </form>
    </div>
  );
};
