import { type ChangeEvent, type FC, type SyntheticEvent, useCallback, useEffect } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';
import { PlusIcon } from '@radix-ui/react-icons';

import type { CreateExerciseRequest, Exercise } from '../../services/exercises/exercises.models';
import { createExercise, listExercises, updateExercise } from '../../services/exercises/exercises.service';
import { Button } from '../Button/Button';
import { DialogActions } from '../Dialog/Actions/Dialog-Actions';
import { DialogContent } from '../Dialog/Content/Dialog-Content';
import { Dialog } from '../Dialog/Dialog';
import { DialogTitle } from '../Dialog/Title/Dialog-Title';
import { ExerciseFormDialog } from '../ExerciseFormDialog/ExerciseFormDialog';
import { ExerciseList } from '../ExerciseList/ExerciseList';
import { Fab } from '../Fab/Fab';
import { Input } from '../Input/Input';
import { Loading } from '../Loading/Loading';

import './Exercises.scss';

const cnExercises = cn('Exercises');

type ExercisesState = {
  searchQuery: string;
  exercises: readonly Exercise[];
  loading: boolean;
  error?: string;
  createFormOpen: boolean;
  editExercise?: Exercise;
  formName: string;
  formNotes: string;
  submitting: boolean;
  formError?: string;
  archiveTarget?: Exercise;
  archiveSubmitting: boolean;
  archiveError?: string;
  setSearchQuery(value: string): void;
  setExercises(value: readonly Exercise[]): void;
  setLoading(value: boolean): void;
  setError(value: string | undefined): void;
  openCreateForm(): void;
  closeCreateForm(): void;
  resetForm(): void;
  openEditForm(exercise: Exercise): void;
  closeEditForm(): void;
  setFormName(value: string): void;
  setFormNotes(value: string): void;
  setSubmitting(value: boolean): void;
  setFormError(value: string | undefined): void;
  openArchiveDialog(exercise: Exercise): void;
  closeArchiveDialog(): void;
  setArchiveSubmitting(value: boolean): void;
  setArchiveError(value: string | undefined): void;
  get filteredExercises(): Exercise[];
};

function matchesSearch(exercise: Exercise, query: string): boolean {
  return exercise.name.toLowerCase().includes(query.toLowerCase());
}

function filterExercisesBySearch(exercises: readonly Exercise[], query: string): Exercise[] {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length === 0) {
    return [...exercises];
  }

  return exercises.filter(exercise => matchesSearch(exercise, trimmedQuery));
}

function buildCreatePayload(name: string, notes: string): CreateExerciseRequest | undefined {
  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return undefined;
  }

  const trimmedNotes = notes.trim();
  return trimmedNotes.length > 0 ? { name: trimmedName, notes: trimmedNotes } : { name: trimmedName };
}

function buildUpdatePayload(name: string, notes: string): { readonly name: string; readonly notes: string | null } {
  return {
    name: name.trim(),
    notes: notes.trim().length > 0 ? notes.trim() : null
  };
}

export const Exercises: FC = observer(() => {
  const state = useLocalObservable<ExercisesState>(() => ({
    searchQuery: '',
    exercises: [],
    loading: true,
    createFormOpen: false,
    formName: '',
    formNotes: '',
    submitting: false,
    archiveSubmitting: false,
    setSearchQuery(value) {
      this.searchQuery = value;
    },
    setExercises(value) {
      this.exercises = value;
    },
    setLoading(value) {
      this.loading = value;
    },
    setError(value) {
      this.error = value;
    },
    openCreateForm() {
      this.resetForm();
      this.createFormOpen = true;
    },
    closeCreateForm() {
      this.createFormOpen = false;
    },
    resetForm() {
      this.editExercise = undefined;
      this.formName = '';
      this.formNotes = '';
      this.formError = undefined;
    },
    openEditForm(exercise) {
      this.editExercise = exercise;
      this.formName = exercise.name;
      this.formNotes = exercise.notes ?? '';
      this.formError = undefined;
      this.createFormOpen = true;
    },
    closeEditForm() {
      this.createFormOpen = false;
      this.editExercise = undefined;
    },
    setFormName(value) {
      this.formName = value;
    },
    setFormNotes(value) {
      this.formNotes = value;
    },
    setSubmitting(value) {
      this.submitting = value;
    },
    setFormError(value) {
      this.formError = value;
    },
    openArchiveDialog(exercise) {
      this.archiveTarget = exercise;
      this.archiveError = undefined;
    },
    closeArchiveDialog() {
      this.archiveTarget = undefined;
    },
    setArchiveSubmitting(value) {
      this.archiveSubmitting = value;
    },
    setArchiveError(value) {
      this.archiveError = value;
    },
    get filteredExercises() {
      return filterExercisesBySearch(this.exercises, this.searchQuery);
    }
  }));

  const loadExercises = useCallback(async () => {
    state.setLoading(true);
    state.setError(undefined);

    try {
      const loadedExercises = await listExercises();
      state.setExercises(loadedExercises);
    } catch {
      state.setError('Не удалось загрузить упражнения');
    } finally {
      state.setLoading(false);
    }
  }, [state]);

  useEffect(() => {
    void loadExercises();
  }, [loadExercises]);

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      state.setSearchQuery(event.target.value);
    },
    [state]
  );

  const handleCreateCancel = useCallback(() => {
    if (state.submitting) {
      return;
    }
    state.closeCreateForm();
    state.resetForm();
  }, [state]);

  const handleEditCancel = useCallback(() => {
    if (state.submitting) {
      return;
    }
    state.closeEditForm();
    state.resetForm();
  }, [state]);

  const saveExercise = useCallback(
    async (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      state.setFormError(undefined);

      const payload = buildUpdatePayload(state.formName, state.formNotes);
      if (payload.name.length === 0) {
        state.setFormError('Укажите название упражнения');
        return;
      }

      state.setSubmitting(true);
      try {
        const savedExercise =
          state.editExercise === undefined
            ? await createExercise(
                buildCreatePayload(state.formName, state.formNotes) ?? { name: state.formName.trim() }
              )
            : await updateExercise(state.editExercise.id, payload);
        state.setExercises(
          state.editExercise === undefined
            ? [...state.exercises, savedExercise]
            : state.exercises.map(exercise => (exercise.id === savedExercise.id ? savedExercise : exercise))
        );
        state.closeCreateForm();
        state.closeEditForm();
        state.resetForm();
      } catch {
        state.setFormError('Не удалось сохранить упражнение');
      } finally {
        state.setSubmitting(false);
      }
    },
    [state]
  );

  const handleArchiveConfirm = useCallback(async () => {
    if (state.archiveTarget === undefined || state.archiveSubmitting) {
      return;
    }

    state.setArchiveError(undefined);
    state.setArchiveSubmitting(true);
    try {
      await updateExercise(state.archiveTarget.id, { archived: true });
      state.setExercises(state.exercises.filter(exercise => exercise.id !== state.archiveTarget?.id));
      state.closeArchiveDialog();
    } catch {
      state.setArchiveError('Не удалось архивировать упражнение');
    } finally {
      state.setArchiveSubmitting(false);
    }
  }, [state]);

  const handleRetry = useCallback(() => {
    void loadExercises();
  }, [loadExercises]);

  const isSearchActive = state.searchQuery.trim().length > 0;
  const showLists = !state.loading && state.error === undefined;

  return (
    <div className={cnExercises()}>
      <main className={cnExercises('Main')}>
        <header className={cnExercises('Header')}>
          <h1 className={cnExercises('Title')}>Упражнения</h1>
        </header>

        <div className={cnExercises('Search')}>
          <Input
            className={cnExercises('SearchField')}
            onChange={handleSearchChange}
            placeholder='Поиск по названию…'
            value={state.searchQuery}
          />
        </div>

        <div className={cnExercises('Content')}>
          {state.loading && <Loading className={cnExercises('Loading')} visible />}

          {state.error !== undefined && (
            <div className={cnExercises('ErrorBlock')}>
              <p className={cnExercises('Error')}>{state.error}</p>
              <Button className={cnExercises('Retry')} color='secondary' onClick={handleRetry} type='button'>
                Повторить
              </Button>
            </div>
          )}

          {showLists && (
            <ExerciseList
              exercises={state.filteredExercises}
              isSearchActive={isSearchActive}
              onArchive={state.openArchiveDialog}
              onEdit={state.openEditForm}
            />
          )}
        </div>
      </main>

      <Fab
        ariaLabel='Добавить упражнение'
        className={cnExercises('Fab')}
        icon={<PlusIcon />}
        onClick={state.openCreateForm}
      />

      {state.createFormOpen && (
        <ExerciseFormDialog
          error={state.formError}
          mode={state.editExercise === undefined ? 'create' : 'edit'}
          name={state.formName}
          notes={state.formNotes}
          onCancel={state.editExercise === undefined ? handleCreateCancel : handleEditCancel}
          onNameChange={state.setFormName}
          onNotesChange={state.setFormNotes}
          onSubmit={saveExercise}
          submitting={state.submitting}
        />
      )}

      {state.archiveTarget !== undefined && (
        <Dialog
          ariaLabel='Архивировать упражнение?'
          className={cnExercises('ArchiveDialog')}
          onCancel={state.closeArchiveDialog}
        >
          <DialogTitle>Архивировать упражнение?</DialogTitle>
          <DialogContent>
            <p>«{state.archiveTarget.name}» скроется из справочника, но сохранится в истории.</p>
            {state.archiveError !== undefined && <p role='alert'>{state.archiveError}</p>}
          </DialogContent>
          <DialogActions>
            <Button
              className={cnExercises('ArchiveCancel')}
              disabled={state.archiveSubmitting}
              onClick={state.closeArchiveDialog}
              type='button'
            >
              Отмена
            </Button>
            <Button
              className={cnExercises('ArchiveConfirm')}
              color='primary'
              disabled={state.archiveSubmitting}
              onClick={handleArchiveConfirm}
              type='button'
            >
              {state.archiveSubmitting ? 'Архивирование…' : 'Архивировать'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
});
