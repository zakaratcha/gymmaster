import type { Client } from '../../services/clients/clients.models';

export const MOCK_CLIENTS: readonly Client[] = [
  { id: 'client-1', name: 'Анна Иванова' },
  { id: 'client-2', name: 'Иван Петров' },
  { id: 'client-3', name: 'Мария Сидорова' },
  { id: 'client-4', name: 'Дмитрий Козлов' },
  { id: 'client-5', name: 'Елена Волкова' },
  { id: 'client-6', name: 'Алексей Новиков' },
  { id: 'client-7', name: 'Ольга Морозова' },
  { id: 'client-8', name: 'Сергей Лебедев' }
];

export const MOCK_RECENT_CLIENT_IDS: readonly string[] = ['client-1', 'client-2', 'client-3'];
