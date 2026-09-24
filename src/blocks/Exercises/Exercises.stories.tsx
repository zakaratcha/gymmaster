import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';

import { Exercises } from './Exercises';

const withRouter: Decorator = Story => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);

const meta = {
  title: 'Blocks/Exercises',
  component: Exercises,
  decorators: [withRouter]
} satisfies Meta<typeof Exercises>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
