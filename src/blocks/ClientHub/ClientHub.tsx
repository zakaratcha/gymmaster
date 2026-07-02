import { type FC, useCallback, useEffect } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { cn } from '@bem-react/classname';
import { useNavigate, useParams } from 'react-router-dom';

import type { Client } from '../../services/clients/clients.models';
import { getClientById } from '../../services/clients/clients.service';
import { Button } from '../Button/Button';
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

  const { client, loading, error, notesExpanded, setClient, setLoading, setError, toggleNotesExpanded } = state;

  const loadClient = useCallback(async () => {
    if (id === undefined || id.length === 0) {
      setError('Клиент не найден');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const loadedClient = await getClientById(id);
      setClient(loadedClient);
    } catch {
      setError('Не удалось загрузить клиента');
      setClient(undefined);
    } finally {
      setLoading(false);
    }
  }, [id, setClient, setError, setLoading]);

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

  const handleEdit = useCallback(() => {
    // TODO: редактор клиента
  }, []);

  const notes = client?.notes?.trim() ?? '';
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
          <h1 className={cnClientHub('Title')}>{client?.name ?? 'Клиент'}</h1>
          <Button className={cnClientHub('Edit')} disabled={client === undefined} onClick={handleEdit} type='button'>
            Править
          </Button>
        </header>

        <div className={cnClientHub('Content')}>
          {loading ? <Loading className={cnClientHub('Loading')} visible /> : null}

          {error === undefined ? null : (
            <div className={cnClientHub('ErrorBlock')}>
              <p className={cnClientHub('Error')}>{error}</p>
              <Button className={cnClientHub('Retry')} color='secondary' onClick={handleRetry} type='button'>
                Повторить
              </Button>
            </div>
          )}

          {!loading && error === undefined && client !== undefined ? (
            <>
              <section className={cnClientHub('Section', { type: 'notes' })}>
                <button
                  aria-expanded={notesExpanded}
                  className={cnClientHub('NotesToggle')}
                  onClick={toggleNotesExpanded}
                  type='button'
                >
                  <span className={cnClientHub('SectionLabel')}>Заметки</span>
                  <span className={cnClientHub('NotesPreview')}>
                    {notesExpanded && hasNotes ? notes : notesPreview}
                  </span>
                </button>
              </section>

              <section className={cnClientHub('Section', { type: 'bodyWeight' })}>
                <div className={cnClientHub('Row')}>
                  <span className={cnClientHub('SectionLabel')}>Вес тела</span>
                  <span className={cnClientHub('BodyWeight')}>{formatBodyWeightKg(client.bodyWeightKg)}</span>
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
          ) : null}
        </div>
      </main>
    </div>
  );
});
