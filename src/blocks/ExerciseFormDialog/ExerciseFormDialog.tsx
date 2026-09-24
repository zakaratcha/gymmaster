import { type ChangeEvent, type FC, type SyntheticEvent, useCallback } from 'react';
import { cn } from '@bem-react/classname';

import { Button } from '../Button/Button';
import { DialogActions } from '../Dialog/Actions/Dialog-Actions';
import { DialogContent } from '../Dialog/Content/Dialog-Content';
import { Dialog } from '../Dialog/Dialog';
import { DialogTitle } from '../Dialog/Title/Dialog-Title';
import { Input } from '../Input/Input';
import { Textarea } from '../Textarea/Textarea';

import './ExerciseFormDialog.scss';

const cnExerciseFormDialog = cn('ExerciseFormDialog');

type ExerciseFormDialogProps = {
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

export const ExerciseFormDialog: FC<ExerciseFormDialogProps> = ({
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
    <Dialog ariaLabel={title} className={cnExerciseFormDialog()} onCancel={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <form className={cnExerciseFormDialog('Form')} id='exercise-form' onSubmit={onSubmit}>
          {error !== undefined && (
            <p className={cnExerciseFormDialog('Error')} role='alert'>
              {error}
            </p>
          )}
          <Input
            className={cnExerciseFormDialog('NameField')}
            disabled={submitting}
            id='exercise-name'
            label='Название'
            name='name'
            onChange={handleNameChange}
            placeholder='Например, приседание со штангой'
            value={name}
          />
          <Textarea
            className={cnExerciseFormDialog('NotesField')}
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
      </DialogContent>
      <DialogActions>
        <Button className={cnExerciseFormDialog('Cancel')} disabled={submitting} onClick={onCancel} type='button'>
          Отмена
        </Button>
        <Button
          className={cnExerciseFormDialog('Submit')}
          color='primary'
          disabled={submitting}
          form='exercise-form'
          type='submit'
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
