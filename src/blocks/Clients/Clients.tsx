import { type ChangeEvent, type FC, type SyntheticEvent, useCallback, useEffect } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';
import { PlusIcon } from '@radix-ui/react-icons';
import { useNavigate } from 'react-router-dom';

import type { Client, CreateClientRequest } from '../../services/clients/clients.models';
import {
  createClient,
  getRecentClientIds,
  listClients,
  pushRecentClientId,
  resolveRecentClientIds
} from '../../services/clients/clients.service';
import { Button } from '../Button/Button';
import { ClientCreateForm } from '../ClientCreateForm/ClientCreateForm';
import { Fab } from '../Fab/Fab';
import { Input } from '../Input/Input';
import { Loading } from '../Loading/Loading';

import './Clients.scss';

const cnClients = cn('Clients');

type ClientsProps = {
  readonly initialClients?: readonly Client[];
  readonly initialRecentIds?: readonly string[];
};

type ClientsState = {
  searchQuery: string;
  clients: readonly Client[];
  recentClientIds: readonly string[];
  loading: boolean;
  error?: string;
  createFormOpen: boolean;
  createName: string;
  createNotes: string;
  createBodyWeightKg: string;
  submitting: boolean;
  createError?: string;
  setSearchQuery(value: string): void;
  setClients(value: readonly Client[]): void;
  appendClient(client: Client): void;
  setRecentClientIds(value: readonly string[]): void;
  setLoading(value: boolean): void;
  setError(value: string | undefined): void;
  openCreateForm(): void;
  closeCreateForm(): void;
  resetCreateForm(): void;
  setCreateName(value: string): void;
  setCreateNotes(value: string): void;
  setCreateBodyWeightKg(value: string): void;
  setSubmitting(value: boolean): void;
  setCreateError(value: string | undefined): void;
  get filteredClients(): Client[];
  get recentClients(): Client[];
};

function getFirstName(name: string): string {
  const [firstName] = name.trim().split(/\s+/);
  return firstName ?? name;
}

function matchesSearch(name: string, query: string): boolean {
  return name.toLowerCase().includes(query.toLowerCase());
}

function filterClientsBySearch(clients: readonly Client[], query: string): Client[] {
  const trimmedQuery = query.trim();
  if (trimmedQuery.length === 0) {
    return [...clients];
  }

  return clients.filter(client => matchesSearch(client.name, trimmedQuery));
}

function resolveRecentClients(recentClientIds: readonly string[], clients: readonly Client[], query: string): Client[] {
  const trimmedQuery = query.trim();
  const clientsById = new Map(clients.map(client => [client.id, client]));

  return recentClientIds
    .map(id => clientsById.get(id))
    .filter((client): client is Client => client !== undefined)
    .filter(client => trimmedQuery.length === 0 || matchesSearch(client.name, trimmedQuery));
}

function buildCreatePayload(name: string, notes: string, bodyWeightKg: string): CreateClientRequest | undefined {
  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return undefined;
  }

  const trimmedNotes = notes.trim();
  const trimmedWeight = bodyWeightKg.trim();

  let payload: CreateClientRequest = { name: trimmedName };

  if (trimmedNotes.length > 0) {
    payload = { ...payload, notes: trimmedNotes };
  }

  if (trimmedWeight.length > 0) {
    const parsedWeight = Number.parseFloat(trimmedWeight);
    if (!Number.isNaN(parsedWeight)) {
      payload = { ...payload, bodyWeightKg: parsedWeight };
    }
  }

  return payload;
}

export const Clients: FC<ClientsProps> = observer(({ initialClients, initialRecentIds }) => {
  const navigate = useNavigate();
  const isStaticMode = initialClients !== undefined;

  const state = useLocalObservable<ClientsState>(() => ({
    searchQuery: '',
    clients: initialClients ?? [],
    recentClientIds: initialRecentIds ?? [],
    loading: !isStaticMode,
    createFormOpen: false,
    createName: '',
    createNotes: '',
    createBodyWeightKg: '',
    submitting: false,
    setSearchQuery(value) {
      this.searchQuery = value;
    },
    setClients(value) {
      this.clients = value;
    },
    appendClient(client) {
      this.clients = [...this.clients, client];
    },
    setRecentClientIds(value) {
      this.recentClientIds = value;
    },
    setLoading(value) {
      this.loading = value;
    },
    setError(value) {
      this.error = value;
    },
    openCreateForm() {
      this.createFormOpen = true;
    },
    closeCreateForm() {
      this.createFormOpen = false;
    },
    resetCreateForm() {
      this.createName = '';
      this.createNotes = '';
      this.createBodyWeightKg = '';
      this.createError = undefined;
    },
    setCreateName(value) {
      this.createName = value;
    },
    setCreateNotes(value) {
      this.createNotes = value;
    },
    setCreateBodyWeightKg(value) {
      this.createBodyWeightKg = value;
    },
    setSubmitting(value) {
      this.submitting = value;
    },
    setCreateError(value) {
      this.createError = value;
    },
    get filteredClients() {
      return filterClientsBySearch(this.clients, this.searchQuery);
    },
    get recentClients() {
      return resolveRecentClients(this.recentClientIds, this.clients, this.searchQuery);
    }
  }));

  const {
    searchQuery,
    loading,
    error,
    createFormOpen,
    createName,
    createNotes,
    createBodyWeightKg,
    submitting,
    createError,
    filteredClients,
    recentClients,
    clients,
    setSearchQuery,
    setClients,
    appendClient,
    setRecentClientIds,
    setLoading,
    setError,
    openCreateForm,
    closeCreateForm,
    resetCreateForm,
    setCreateName,
    setCreateNotes,
    setCreateBodyWeightKg,
    setSubmitting,
    setCreateError
  } = state;

  const loadClients = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const clients = await listClients();
      setClients(clients);
      setRecentClientIds(resolveRecentClientIds(clients));
    } catch {
      setError('Не удалось загрузить клиентов');
    } finally {
      setLoading(false);
    }
  }, [setClients, setError, setLoading, setRecentClientIds]);

  useEffect(() => {
    if (!isStaticMode) {
      void loadClients();
    }
  }, [isStaticMode, loadClients]);

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
    resetCreateForm();
  }, [closeCreateForm, resetCreateForm, submitting]);

  const handleCreateSubmit = useCallback(
    async (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      setCreateError(undefined);

      const payload = buildCreatePayload(createName, createNotes, createBodyWeightKg);
      if (payload === undefined) {
        setCreateError('Укажите имя клиента');
        return;
      }

      setSubmitting(true);

      try {
        const client = await createClient(payload);
        appendClient(client);
        pushRecentClientId(client.id);
        setRecentClientIds(resolveRecentClientIds([...clients, client]));
        closeCreateForm();
        resetCreateForm();
      } catch {
        setCreateError('Не удалось создать клиента');
      } finally {
        setSubmitting(false);
      }
    },
    [
      appendClient,
      clients,
      closeCreateForm,
      createBodyWeightKg,
      createName,
      createNotes,
      resetCreateForm,
      setCreateError,
      setRecentClientIds,
      setSubmitting
    ]
  );

  const handleRetry = useCallback(() => {
    void loadClients();
  }, [loadClients]);

  const handleClientClick = useCallback(
    (event: SyntheticEvent<HTMLButtonElement>) => {
      const clientId = event.currentTarget.dataset.clientId;
      if (clientId === undefined) {
        return;
      }

      pushRecentClientId(clientId);
      setRecentClientIds(getRecentClientIds());
      void navigate(`/clients/${clientId}`);
    },
    [navigate, setRecentClientIds]
  );

  const isSearchActive = searchQuery.trim().length > 0;
  const showRecent = !loading && error === undefined && recentClients.length > 0;
  const showEmpty = !loading && error === undefined && filteredClients.length === 0;
  const showLists = !loading && error === undefined;

  return (
    <div className={cnClients()}>
      <main className={cnClients('Main')}>
        <header className={cnClients('Header')}>
          <h1 className={cnClients('Title')}>Клиенты</h1>
        </header>

        <div className={cnClients('Search')}>
          <Input
            className={cnClients('SearchField')}
            onChange={handleSearchChange}
            placeholder='Поиск по имени…'
            value={searchQuery}
          />
        </div>

        <div className={cnClients('Content')}>
          {loading ? <Loading className={cnClients('Loading')} visible /> : null}

          {error === undefined ? null : (
            <div className={cnClients('ErrorBlock')}>
              <p className={cnClients('Error')}>{error}</p>
              <Button className={cnClients('Retry')} color='secondary' onClick={handleRetry} type='button'>
                Повторить
              </Button>
            </div>
          )}

          {showLists ? (
            <>
              {showRecent ? (
                <section className={cnClients('Section', { type: 'recent' })}>
                  <h2 className={cnClients('SectionTitle')}>Недавние</h2>
                  <div className={cnClients('RecentList')}>
                    {recentClients.map(client => (
                      <button
                        key={client.id}
                        className={cnClients('RecentChip')}
                        data-client-id={client.id}
                        onClick={handleClientClick}
                        type='button'
                      >
                        {getFirstName(client.name)}
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className={cnClients('Section', { type: 'all' })}>
                <h2 className={cnClients('SectionTitle')}>Все клиенты</h2>
                {showEmpty ? (
                  <p className={cnClients('Empty')}>{isSearchActive ? 'Ничего не найдено' : 'Добавить клиента'}</p>
                ) : (
                  <ul className={cnClients('List')}>
                    {filteredClients.map(client => (
                      <li key={client.id} className={cnClients('ListItem')}>
                        <button
                          className={cnClients('Row')}
                          data-client-id={client.id}
                          onClick={handleClientClick}
                          type='button'
                        >
                          <span className={cnClients('RowName')}>{client.name}</span>
                          <span aria-hidden='true' className={cnClients('RowChevron')}>
                            ›
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          ) : null}
        </div>
      </main>

      <Fab ariaLabel='Добавить клиента' className={cnClients('Fab')} icon={<PlusIcon />} onClick={openCreateForm} />

      {createFormOpen ? (
        <ClientCreateForm
          bodyWeightKg={createBodyWeightKg}
          error={createError}
          name={createName}
          notes={createNotes}
          onBodyWeightKgChange={setCreateBodyWeightKg}
          onCancel={handleCreateCancel}
          onNameChange={setCreateName}
          onNotesChange={setCreateNotes}
          onSubmit={handleCreateSubmit}
          submitting={submitting}
        />
      ) : null}
    </div>
  );
});
