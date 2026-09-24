import { type FC, type SyntheticEvent, useCallback, useEffect, useRef } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';
import { useNavigate, useParams } from 'react-router-dom';

import type { Client } from '../../services/clients/clients.models';
import { deleteClient, getClientById, updateClient } from '../../services/clients/clients.service';
import { Button } from '../Button/Button';
import { ClientCreateForm } from '../ClientCreateForm/ClientCreateForm';
import { Loading } from '../Loading/Loading';

import './ClientHub.scss';

const cnClientHub = cn('ClientHub');

type ClientHubProps = {
  readonly initialClient?: Client;
};

type ClientHubState = {
  client?: Client;
  loading: boolean;
  error?: string;
  notesExpanded: boolean;
  editOpen: boolean;
  editName: string;
  editNotes: string;
  editBodyWeightKg: string;
  submitting: boolean;
  mutationError?: string;
  openEdit(): void;
  closeEdit(): void;
  setEditName(value: string): void;
  setEditNotes(value: string): void;
  setEditBodyWeightKg(value: string): void;
  setSubmitting(value: boolean): void;
  setMutationError(value: string | undefined): void;
  setClient(value: Client | undefined): void;
  setLoading(value: boolean): void;
  setError(value: string | undefined): void;
  toggleNotesExpanded(): void;
};

function formatBodyWeightKg(bodyWeightKg: number | undefined): string {
  if (bodyWeightKg === undefined) {
    return '—';
  }

  return `${bodyWeightKg} кг`;
}

function truncateNotes(notes: string, maxLength: number): string {
  if (notes.length <= maxLength) {
    return notes;
  }

  return `${notes.slice(0, maxLength).trimEnd()}…`;
}

export const ClientHub: FC<ClientHubProps> = observer(({ initialClient }) => {
  const staticMode = initialClient !== undefined;
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const state = useLocalObservable<ClientHubState>(() => ({
    client: initialClient,
    loading: !staticMode,
    notesExpanded: false,
    editOpen: false,
    editName: '',
    editNotes: '',
    editBodyWeightKg: '',
    submitting: false,
    mutationError: undefined,
    openEdit() {
      if (this.client === undefined) {
        return;
      }
      this.editName = this.client.name;
      this.editNotes = this.client.notes ?? '';
      this.editBodyWeightKg = this.client.bodyWeightKg?.toString() ?? '';
      this.mutationError = undefined;
      this.editOpen = true;
    },
    closeEdit() {
      if (!this.submitting) {
        this.editOpen = false;
      }
    },
    setEditName(value) {
      this.editName = value;
    },
    setEditNotes(value) {
      this.editNotes = value;
    },
    setEditBodyWeightKg(value) {
      this.editBodyWeightKg = value;
    },
    setSubmitting(value) {
      this.submitting = value;
    },
    setMutationError(value) {
      this.mutationError = value;
    },
    setClient(value) {
      this.client = value;
    },
    setLoading(value) {
      this.loading = value;
    },
    setError(value) {
      this.error = value;
    },
    toggleNotesExpanded() {
      this.notesExpanded = !this.notesExpanded;
    }
  }));

  const loadClient = useCallback(async () => {
    if (id === undefined || id.length === 0) {
      state.setError('Клиент не найден');
      state.setLoading(false);
      return;
    }

    state.setLoading(true);
    state.setError(undefined);

    try {
      const loadedClient = await getClientById(id);
      state.setClient(loadedClient);
    } catch {
      state.setError('Не удалось загрузить клиента');
      state.setClient(undefined);
    } finally {
      state.setLoading(false);
    }
  }, [id, state]);

  useEffect(() => {
    if (!staticMode) {
      void loadClient();
    }
  }, [staticMode, loadClient]);

  const handleBack = useCallback(() => {
    void navigate('/clients');
  }, [navigate]);

  const handleRetry = useCallback(() => {
    void loadClient();
  }, [loadClient]);

  const deleteDialogRef = useRef<HTMLDialogElement>(null);

  const handleEdit = useCallback(() => {
    state.openEdit();
  }, [state]);

  const handleSave = useCallback(
    async (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (state.submitting || state.client === undefined) {
        return;
      }
      state.setMutationError(undefined);
      const name = state.editName.trim();
      const weight = state.editBodyWeightKg.trim();
      const bodyWeightKg = weight.length === 0 ? null : Number(weight);
      if (name.length === 0) {
        state.setMutationError('Укажите имя клиента');
        return;
      }
      if (bodyWeightKg !== null && (!Number.isFinite(bodyWeightKg) || bodyWeightKg <= 0)) {
        state.setMutationError('Вес должен быть положительным числом');
        return;
      }
      if (staticMode) {
        state.setMutationError('Сохранение недоступно в демонстрационном режиме');
        return;
      }
      state.setSubmitting(true);
      try {
        const updated = await updateClient(state.client.id, { name, notes: state.editNotes.trim(), bodyWeightKg });
        state.setClient(updated);
        state.setSubmitting(false);
        state.closeEdit();
      } catch {
        state.setMutationError('Не удалось сохранить клиента');
      } finally {
        state.setSubmitting(false);
      }
    },
    [state, staticMode]
  );

  const handleDeleteOpen = useCallback(() => {
    state.setMutationError(undefined);
    deleteDialogRef.current?.showModal();
  }, [state]);

  const handleDeleteCancel = useCallback(() => {
    if (!state.submitting) {
      deleteDialogRef.current?.close();
    }
  }, [state]);

  const handleDeleteEscape = useCallback(
    (event: SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      handleDeleteCancel();
    },
    [handleDeleteCancel]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (state.submitting || state.client === undefined) {
      return;
    }
    state.setMutationError(undefined);
    if (staticMode) {
      state.setMutationError('Удаление недоступно в демонстрационном режиме');
      return;
    }
    state.setSubmitting(true);
    try {
      await deleteClient(state.client.id);
      deleteDialogRef.current?.close();
      void navigate('/clients', { replace: true });
    } catch {
      state.setMutationError('Не удалось удалить клиента');
    } finally {
      state.setSubmitting(false);
    }
  }, [navigate, state, staticMode]);

  const notes = state.client?.notes?.trim() ?? '';
  const hasNotes = notes.length > 0;
  const notesPreview = hasNotes ? truncateNotes(notes, 60) : 'Нет заметок';

  return (
    <div className={cnClientHub()}>
      <main className={cnClientHub('Main')}>
        <header className={cnClientHub('Header')}>
          <button
            aria-label='Назад к списку клиентов'
            className={cnClientHub('Back')}
            onClick={handleBack}
            type='button'
          >
            ←
          </button>
          <h1 className={cnClientHub('Title')}>{state.client?.name ?? 'Клиент'}</h1>
          <Button
            className={cnClientHub('Edit')}
            disabled={state.client === undefined}
            onClick={handleEdit}
            type='button'
          >
            Править
          </Button>
        </header>

        <div className={cnClientHub('Content')}>
          {state.loading && <Loading className={cnClientHub('Loading')} visible />}

          {state.error !== undefined && (
            <div className={cnClientHub('ErrorBlock')}>
              <p className={cnClientHub('Error')}>{state.error}</p>
              <Button className={cnClientHub('Retry')} color='secondary' onClick={handleRetry} type='button'>
                Повторить
              </Button>
            </div>
          )}

          {!state.loading && state.error === undefined && state.client !== undefined && (
            <>
              <section className={cnClientHub('Section', { type: 'notes' })}>
                <button
                  aria-expanded={state.notesExpanded}
                  className={cnClientHub('NotesToggle')}
                  onClick={state.toggleNotesExpanded}
                  type='button'
                >
                  <span className={cnClientHub('SectionLabel')}>Заметки</span>
                  <span className={cnClientHub('NotesPreview')}>
                    {state.notesExpanded && hasNotes ? notes : notesPreview}
                  </span>
                </button>
              </section>

              <section className={cnClientHub('Section', { type: 'bodyWeight' })}>
                <div className={cnClientHub('Row')}>
                  <span className={cnClientHub('SectionLabel')}>Вес тела</span>
                  <span className={cnClientHub('BodyWeight')}>{formatBodyWeightKg(state.client.bodyWeightKg)}</span>
                </div>
              </section>

              <section className={cnClientHub('Section', { type: 'plan' })}>
                <h2 className={cnClientHub('SectionTitle')}>Ближайший план</h2>
                <p className={cnClientHub('StubText')}>Нет предстоящих планов</p>
                <Button className={cnClientHub('StubAction')} disabled type='button'>
                  Все планы
                </Button>
              </section>

              <section className={cnClientHub('Section', { type: 'actions' })}>
                <h2 className={cnClientHub('SectionTitle')}>Действия</h2>
                <p className={cnClientHub('SoonHint')}>Скоро</p>
                <div className={cnClientHub('ActionRow')}>
                  <Button className={cnClientHub('ActionButton')} disabled type='button'>
                    Старт с плана ▼
                  </Button>
                  <Button className={cnClientHub('ActionButton')} disabled type='button'>
                    Пустая сессия
                  </Button>
                </div>
              </section>

              <section className={cnClientHub('Section', { type: 'history' })}>
                <h2 className={cnClientHub('SectionTitle')}>История</h2>
                <p className={cnClientHub('SoonHint')}>Скоро</p>
                <div className={cnClientHub('HistoryList')}>
                  <button className={cnClientHub('HistoryItem')} disabled type='button'>
                    Последние тренировки
                  </button>
                  <button className={cnClientHub('HistoryItem')} disabled type='button'>
                    История упражнения…
                  </button>
                </div>
              </section>

              <section className={cnClientHub('Section', { type: 'split' })}>
                <h2 className={cnClientHub('SectionTitle')}>Сплит</h2>
                <p className={cnClientHub('SoonHint')}>Скоро</p>
                <div className={cnClientHub('SplitRow')}>
                  <span className={cnClientHub('SplitTags')}>ноги · верх · день А</span>
                  <div className={cnClientHub('SplitActions')}>
                    <Button className={cnClientHub('SplitButton')} disabled type='button'>
                      + тег
                    </Button>
                    <Button aria-label='Настройки сплита' className={cnClientHub('SplitButton')} disabled type='button'>
                      ⚙
                    </Button>
                  </div>
                </div>
              </section>
            </>
          )}
          {!state.loading && state.client !== undefined && (
            <Button className={cnClientHub('Delete')} onClick={handleDeleteOpen} type='button'>
              Удалить клиента
            </Button>
          )}
        </div>
      </main>
      {state.editOpen && (
        <ClientCreateForm
          bodyWeightKg={state.editBodyWeightKg}
          error={state.mutationError}
          mode='edit'
          name={state.editName}
          notes={state.editNotes}
          onBodyWeightKgChange={state.setEditBodyWeightKg}
          onCancel={state.closeEdit}
          onNameChange={state.setEditName}
          onNotesChange={state.setEditNotes}
          onSubmit={handleSave}
          submitting={state.submitting}
        />
      )}
      <dialog
        aria-describedby='client-delete-description'
        aria-labelledby='client-delete-title'
        className={cnClientHub('DeleteDialog')}
        onCancel={handleDeleteEscape}
        ref={deleteDialogRef}
      >
        <h2 id='client-delete-title'>Удалить клиента?</h2>
        <p id='client-delete-description'>Клиент «{state.client?.name}» будет удалён. Это действие нельзя отменить.</p>
        {state.mutationError !== undefined && (
          <p className={cnClientHub('DeleteError')} role='alert'>
            {state.mutationError}
          </p>
        )}
        <div className={cnClientHub('ActionRow')}>
          <Button
            className={cnClientHub('DeleteCancel')}
            disabled={state.submitting}
            onClick={handleDeleteCancel}
            type='button'
          >
            Отмена
          </Button>
          <Button
            className={cnClientHub('DeleteConfirm')}
            disabled={state.submitting}
            onClick={handleDeleteConfirm}
            type='button'
          >
            {state.submitting ? 'Удаление…' : 'Удалить'}
          </Button>
        </div>
      </dialog>
    </div>
  );
});
