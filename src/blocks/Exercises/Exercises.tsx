import { type ChangeEvent, type FC, type SyntheticEvent, useCallback, useEffect, useRef } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';
import { PlusIcon } from '@radix-ui/react-icons';

import type { CreateExerciseRequest, Exercise } from '../../services/exercises/exercises.models';
import { createExercise, listExercises, updateExercise } from '../../services/exercises/exercises.service';
import { Button } from '../Button/Button';
import { ExerciseForm } from '../ExerciseForm/ExerciseForm';
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
  const trimmedName = name.trim();
  const trimmedNotes = notes.trim();
  return {
    name: trimmedName,
    ...(trimmedNotes.length > 0 ? { notes: trimmedNotes } : { notes: null })
  };
}

export const Exercises: FC = observer(() => {
  const archiveDialogRef = useRef<HTMLDialogElement>(null);

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

  const {
    searchQuery,
    loading,
    error,
    createFormOpen,
    editExercise,
    formName,
    formNotes,
    submitting,
    formError,
    archiveTarget,
    archiveSubmitting,
    archiveError,
    filteredExercises,
    setSearchQuery,
    setExercises,
    setLoading,
    setError,
    openCreateForm,
    closeCreateForm,
    resetForm,
    openEditForm,
    closeEditForm,
    setFormName,
    setFormNotes,
    setSubmitting,
    setFormError,
    openArchiveDialog,
    closeArchiveDialog,
    setArchiveSubmitting,
    setArchiveError
  } = state;

  useEffect(() => {
    if (archiveTarget === undefined) {
      return;
    }

    const dialog = archiveDialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, [archiveTarget]);

  const loadExercises = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const loadedExercises = await listExercises();
      setExercises(loadedExercises);
    } catch {
      setError('Не удалось загрузить упражнения');
    } finally {
      setLoading(false);
    }
  }, [setExercises, setError, setLoading]);

  useEffect(() => {
    void loadExercises();
  }, [loadExercises]);

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    [setSearchQuery]
  );

  const handleCreateCancel = useCallback(() => {
    if (submitting) {
      return;
    }
    closeCreateForm();
    resetForm();
  }, [closeCreateForm, resetForm, submitting]);

  const handleEditCancel = useCallback(() => {
    if (submitting) {
      return;
    }
    closeEditForm();
    resetForm();
  }, [closeEditForm, resetForm, submitting]);

  const saveExercise = useCallback(
    async (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError(undefined);

      const payload = buildUpdatePayload(formName, formNotes);
      if (payload.name.length === 0) {
        setFormError('Укажите название упражнения');
        return;
      }

      setSubmitting(true);
      try {
        const savedExercise =
          editExercise === undefined
            ? await createExercise(buildCreatePayload(formName, formNotes) ?? { name: formName.trim() })
            : await updateExercise(editExercise.id, payload);
        setExercises(
          editExercise === undefined
            ? [...state.exercises, savedExercise]
            : state.exercises.map(exercise => (exercise.id === savedExercise.id ? savedExercise : exercise))
        );
        closeCreateForm();
        closeEditForm();
        resetForm();
      } catch {
        setFormError('Не удалось сохранить упражнение');
      } finally {
        setSubmitting(false);
      }
    },
    [
      closeCreateForm,
      closeEditForm,
      editExercise,
      formName,
      formNotes,
      resetForm,
      setExercises,
      setFormError,
      setSubmitting,
      state.exercises
    ]
  );

  const handleArchiveCancel = useCallback(
    (event: SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      if (!archiveSubmitting) {
        closeArchiveDialog();
      }
    },
    [archiveSubmitting, closeArchiveDialog]
  );

  const handleArchiveConfirm = useCallback(async () => {
    if (archiveTarget === undefined || archiveSubmitting) {
      return;
    }

    setArchiveError(undefined);
    setArchiveSubmitting(true);
    try {
      await updateExercise(archiveTarget.id, { archived: true });
      setExercises(state.exercises.filter(exercise => exercise.id !== archiveTarget.id));
      closeArchiveDialog();
    } catch {
      setArchiveError('Не удалось архивировать упражнение');
    } finally {
      setArchiveSubmitting(false);
    }
  }, [
    archiveTarget,
    archiveSubmitting,
    closeArchiveDialog,
    setArchiveError,
    setArchiveSubmitting,
    setExercises,
    state.exercises
  ]);

  const handleRetry = useCallback(() => {
    void loadExercises();
  }, [loadExercises]);

  const handleArchiveClick = useCallback(
    (event: SyntheticEvent<HTMLButtonElement>) => {
      const exerciseId = event.currentTarget.dataset.exerciseId;
      const exercise = state.exercises.find(item => item.id === exerciseId);
      if (exercise !== undefined) {
        openArchiveDialog(exercise);
      }
    },
    [openArchiveDialog, state.exercises]
  );

  const handleRowClick = useCallback(
    (event: SyntheticEvent<HTMLButtonElement>) => {
      const exerciseId = event.currentTarget.dataset.exerciseId;
      const exercise = state.exercises.find(item => item.id === exerciseId);
      if (exercise !== undefined) {
        openEditForm(exercise);
      }
    },
    [openEditForm, state.exercises]
  );

  const isSearchActive = searchQuery.trim().length > 0;
  const showEmpty = !loading && error === undefined && filteredExercises.length === 0;
  const showLists = !loading && error === undefined;

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
            value={searchQuery}
          />
        </div>

        <div className={cnExercises('Content')}>
          {loading ? <Loading className={cnExercises('Loading')} visible /> : null}

          {error === undefined ? null : (
            <div className={cnExercises('ErrorBlock')}>
              <p className={cnExercises('Error')}>{error}</p>
              <Button className={cnExercises('Retry')} color='secondary' onClick={handleRetry} type='button'>
                Повторить
              </Button>
            </div>
          )}

          {showLists ? (
            <section className={cnExercises('Section')}>
              <h2 className={cnExercises('SectionTitle')}>Справочник</h2>
              {showEmpty ? (
                <p className={cnExercises('Empty')}>{isSearchActive ? 'Ничего не найдено' : 'Добавить упражнение'}</p>
              ) : (
                <ul className={cnExercises('List')}>
                  {filteredExercises.map(exercise => (
                    <li key={exercise.id} className={cnExercises('ListItem')}>
                      <button
                        className={cnExercises('Row')}
                        data-exercise-id={exercise.id}
                        onClick={handleRowClick}
                        type='button'
                      >
                        <span className={cnExercises('RowName')}>{exercise.name}</span>
                        <span aria-hidden='true' className={cnExercises('RowChevron')}>
                          ›
                        </span>
                      </button>
                      <Button
                        aria-label={`Архивировать ${exercise.name}`}
                        className={cnExercises('ArchiveButton')}
                        onClick={handleArchiveClick}
                        data-exercise-id={exercise.id}
                        type='button'
                      >
                        Архив
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}
        </div>
      </main>

      <Fab
        ariaLabel='Добавить упражнение'
        className={cnExercises('Fab')}
        icon={<PlusIcon />}
        onClick={openCreateForm}
      />

      {createFormOpen ? (
        <ExerciseForm
          error={formError}
          mode={editExercise === undefined ? 'create' : 'edit'}
          name={formName}
          notes={formNotes}
          onCancel={editExercise === undefined ? handleCreateCancel : handleEditCancel}
          onNameChange={setFormName}
          onNotesChange={setFormNotes}
          onSubmit={saveExercise}
          submitting={submitting}
        />
      ) : null}

      {archiveTarget === undefined ? null : (
        <dialog
          aria-describedby='exercise-archive-description'
          aria-labelledby='exercise-archive-title'
          className={cnExercises('ArchiveDialog')}
          onCancel={handleArchiveCancel}
          ref={archiveDialogRef}
        >
          <h2 className={cnExercises('ArchiveTitle')} id='exercise-archive-title'>
            Архивировать упражнение?
          </h2>
          <p className={cnExercises('ArchiveDescription')} id='exercise-archive-description'>
            «{archiveTarget.name}» скроется из справочника, но сохранится в истории.
          </p>
          {archiveError !== undefined && (
            <p className={cnExercises('ArchiveError')} role='alert'>
              {archiveError}
            </p>
          )}
          <div className={cnExercises('ArchiveActions')}>
            <Button
              className={cnExercises('ArchiveCancel')}
              disabled={archiveSubmitting}
              onClick={closeArchiveDialog}
              type='button'
            >
              Отмена
            </Button>
            <Button
              className={cnExercises('ArchiveConfirm')}
              color='primary'
              disabled={archiveSubmitting}
              onClick={handleArchiveConfirm}
              type='button'
            >
              {archiveSubmitting ? 'Архивирование…' : 'Архивировать'}
            </Button>
          </div>
        </dialog>
      )}
    </div>
  );
});
