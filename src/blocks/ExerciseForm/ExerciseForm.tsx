import { type ChangeEvent, type FC, type SyntheticEvent, useCallback, useEffect, useRef } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../Button/Button';
import { Input } from '../Input/Input';

import './ExerciseForm.scss';

const cnExerciseForm = cn('ExerciseForm');

export type ExerciseFormProps = {
  readonly name: string;
  readonly notes: string;
  readonly submitting: boolean;
  readonly error?: string;
  readonly mode?: 'create' | 'edit';
  onNameChange(value: string): void;
  onNotesChange(value: string): void;
  onSubmit(event: SyntheticEvent<HTMLFormElement>): void;
  onCancel(): void;
};

export const ExerciseForm: FC<ExerciseFormProps> = ({
  name,
  notes,
  submitting,
  error,
  mode = 'create',
  onNameChange,
  onNotesChange,
  onSubmit,
  onCancel
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

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

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog aria-labelledby='exercise-form-title' className={cnExerciseForm()} onCancel={handleCancel} ref={dialogRef}>
      <form className={cnExerciseForm('Card')} onSubmit={onSubmit}>
        <h2 className={cnExerciseForm('Title')} id='exercise-form-title'>
          {mode === 'edit' ? 'Редактирование упражнения' : 'Новое упражнение'}
        </h2>
        <Input
          className={cnExerciseForm('NameField')}
          disabled={submitting}
          id='exercise-name'
          label='Название'
          name='name'
          onChange={handleNameChange}
          placeholder='Например, приседание со штангой'
          value={name}
        />
        <div className={cnExerciseForm('NotesField')}>
          <label className={cnExerciseForm('NotesLabel')} htmlFor='exercise-notes'>
            Заметки
          </label>
          <textarea
            className={cnExerciseForm('NotesControl')}
            disabled={submitting}
            id='exercise-notes'
            name='notes'
            onChange={handleNotesChange}
            placeholder='Необязательно'
            rows={3}
            value={notes}
          />
        </div>
        {error !== undefined && (
          <p className={cnExerciseForm('Error')} role='alert'>
            {error}
          </p>
        )}
        <div className={cnExerciseForm('Actions')}>
          <Button className={cnExerciseForm('Cancel')} disabled={submitting} onClick={onCancel} type='button'>
            Отмена
          </Button>
          <Button className={cnExerciseForm('Submit')} color='primary' disabled={submitting} type='submit'>
            {mode === 'edit' ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </form>
    </dialog>
  );
};
