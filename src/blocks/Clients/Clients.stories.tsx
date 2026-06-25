import type { Meta, StoryObj } from '@storybook/react-vite';

import type { Client } from '../../services/clients/clients.models';
import { Clients } from './Clients';

const storyClients: readonly Client[] = [
  { id: 'client-1', name: 'Анна Иванова' },
  { id: 'client-2', name: 'Иван Петров' },
  { id: 'client-3', name: 'Мария Сидорова' },
  { id: 'client-4', name: 'Дмитрий Козлов' },
  { id: 'client-5', name: 'Елена Волкова' },
  { id: 'client-6', name: 'Алексей Новиков' },
  { id: 'client-7', name: 'Ольга Морозова' },
  { id: 'client-8', name: 'Сергей Лебедев' }
];

const storyRecentIds: readonly string[] = ['client-1', 'client-2', 'client-3'];

const meta = {
  title: 'Blocks/Clients',
  component: Clients
} satisfies Meta<typeof Clients>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialClients: storyClients,
    initialRecentIds: storyRecentIds
  }
};

export const Empty: Story = {
  args: {
    initialClients: [],
    initialRecentIds: []
  }
};
