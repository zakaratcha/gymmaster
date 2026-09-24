import { type ChangeEvent, type FC, type SyntheticEvent, useCallback } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../Button/Button';
import { Dialog } from '../Dialog/Dialog';
import { Input } from '../Input/Input';
import { Textarea } from '../Textarea/Textarea';

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
  const title = mode === 'edit' ? 'Редактирование упражнения' : 'Новое упражнение';
  const submitLabel = mode === 'edit' ? 'Сохранить' : 'Создать';
  const handleNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onNameChange(event.target.value);
    },
    [onNameChange]
  );

  return (
    <Dialog
      actions={
        <>
          <Button className={cnExerciseForm('Cancel')} disabled={submitting} onClick={onCancel} type='button'>
            Отмена
          </Button>
          <Button
            className={cnExerciseForm('Submit')}
            color='primary'
            disabled={submitting}
            form='exercise-form'
            type='submit'
          >
            {submitLabel}
          </Button>
        </>
      }
      error={error}
      onCancel={onCancel}
      title={title}
    >
      <form className={cnExerciseForm()} id='exercise-form' onSubmit={onSubmit}>
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
        <Textarea
          className={cnExerciseForm('NotesField')}
          disabled={submitting}
          id='exercise-notes'
          label='Заметки'
          name='notes'
          onChange={onNotesChange}
          placeholder='Необязательно'
          rows={3}
          value={notes}
        />
      </form>
    </Dialog>
  );
};
