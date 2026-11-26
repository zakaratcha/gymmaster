import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';

import type { TrainerRole } from '../../services/trainers/trainers.models';
import { currentUserStore } from '../../stores/currentUser.store';
import { Profile } from './Profile';

function withRoles(roles: readonly TrainerRole[]): Decorator {
  const decorator: Decorator = Story => {
    currentUserStore.setTrainer({
      id: 'story-user-id',
      email: 'user@example.com',
      status: 'active',
      roles
    });

    return (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    );
  };

  return decorator;
}

const meta = {
  title: 'Blocks/Profile',
  component: Profile
} satisfies Meta<typeof Profile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [withRoles(['trainer'])]
};

export const PlatformAdmin: Story = {
  decorators: [withRoles(['trainer', 'platform_admin'])]
};
