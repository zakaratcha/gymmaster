import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';

import { currentUserStore } from '../../stores/currentUser.store';
import { Profile } from './Profile';

const withMockUser: Decorator = Story => {
  currentUserStore.setTrainer({
    id: 'story-user-id',
    email: 'user@example.com',
    status: 'active',
    roles: ['trainer']
  });

  return <Story />;
};

const meta = {
  title: 'Blocks/Profile',
  component: Profile,
  decorators: [withMockUser]
} satisfies Meta<typeof Profile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
