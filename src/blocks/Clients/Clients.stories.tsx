import type { Meta, StoryObj } from '@storybook/react-vite';

import { Clients } from './Clients';

const meta = {
  title: 'Blocks/Clients',
  component: Clients
} satisfies Meta<typeof Clients>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    initialClients: [],
    initialRecentIds: []
  }
};
