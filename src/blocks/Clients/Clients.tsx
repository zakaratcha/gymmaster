import { type ChangeEvent, type FC, useCallback } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';
import { PlusIcon } from '@radix-ui/react-icons';

import type { Client } from '../../services/clients/clients.models';
import { Fab } from '../Fab/Fab';
import { Input } from '../Input/Input';
import { MOCK_CLIENTS, MOCK_RECENT_CLIENT_IDS } from './clients.mock';

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
  setSearchQuery(value: string): void;
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

export const Clients: FC<ClientsProps> = observer(({ initialClients, initialRecentIds }) => {
  const { searchQuery, setSearchQuery, filteredClients, recentClients } = useLocalObservable<ClientsState>(() => ({
    searchQuery: '',
    clients: initialClients ?? MOCK_CLIENTS,
    recentClientIds: initialRecentIds ?? MOCK_RECENT_CLIENT_IDS,
    setSearchQuery(value) {
      this.searchQuery = value;
    },
    get filteredClients() {
      return filterClientsBySearch(this.clients, this.searchQuery);
    },
    get recentClients() {
      return resolveRecentClients(this.recentClientIds, this.clients, this.searchQuery);
    }
  }));

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    [setSearchQuery]
  );

  const isSearchActive = searchQuery.trim().length > 0;
  const showRecent = recentClients.length > 0;
  const showEmpty = filteredClients.length === 0;

  return (
    <div className={cnClients()}>
      <main className={cnClients('Main')}>
        <header className={cnClients('Header')}>
          <h1 className={cnClients('Title')}>Клиенты</h1>
        </header>

        <div className={cnClients('Search')}>
          <Input id='clients-search' onChange={handleSearchChange} placeholder='Поиск по имени…' value={searchQuery} />
        </div>

        {showRecent ? (
          <section className={cnClients('Section', { type: 'recent' })}>
            <h2 className={cnClients('SectionTitle')}>Недавние</h2>
            <div className={cnClients('RecentList')}>
              {recentClients.map(client => (
                <button key={client.id} className={cnClients('RecentChip')} type='button'>
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
                  <button className={cnClients('Row')} type='button'>
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
      </main>

      <Fab ariaLabel='Добавить клиента' icon={<PlusIcon />} />
    </div>
  );
});
