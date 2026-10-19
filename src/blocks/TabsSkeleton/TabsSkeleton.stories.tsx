import type { Meta, StoryObj } from '@storybook/react-vite';

import { TabsSkeleton } from './TabsSkeleton';

const meta = {
  title: 'Blocks/TabsSkeleton',
  component: TabsSkeleton
} satisfies Meta<typeof TabsSkeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ManyTabs: Story = {
  args: {
    tabs: 5
  }
};
