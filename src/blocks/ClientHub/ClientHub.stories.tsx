import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import type { Client } from '../../services/clients/clients.models';
import { ClientHub } from './ClientHub';

const fullClient: Client = {
  id: 'client-1',
  name: 'Анна Иванова',
  notes: 'Аллергия на орехи. Предпочитает утренние тренировки.',
  bodyWeightKg: 72
};

const minimalClient: Client = {
  id: 'client-2',
  name: 'Иван Петров'
};

const withRouter =
  (initialEntry: string): Decorator =>
  Story => (
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path='/clients/:id' element={<Story />} />
      </Routes>
    </MemoryRouter>
  );

const meta = {
  title: 'Blocks/ClientHub',
  component: ClientHub,
  decorators: [withRouter('/clients/client-1')]
} satisfies Meta<typeof ClientHub>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialClient: fullClient
  }
};

export const Minimal: Story = {
  args: {
    initialClient: minimalClient
  },
  decorators: [withRouter('/clients/client-2')]
};
