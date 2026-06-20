import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';

import { Workouts } from './Workouts';

const withRouter: Decorator = Story => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);

const meta = {
  title: 'Blocks/Workouts',
  component: Workouts,
  decorators: [withRouter]
} satisfies Meta<typeof Workouts>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
