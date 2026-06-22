import { PlusIcon } from '@radix-ui/react-icons';
import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';

import { Fab } from './Fab';

const withCanvasHeight: Decorator = Story => (
  <div style={{ minHeight: '12rem', position: 'relative' }}>
    <Story />
  </div>
);

const meta = {
  title: 'Blocks/Fab',
  component: Fab,
  decorators: [withCanvasHeight],
  args: {
    ariaLabel: 'Добавить',
    icon: <PlusIcon />
  }
} satisfies Meta<typeof Fab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true
  }
};
