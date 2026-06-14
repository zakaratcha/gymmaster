import type { Meta, StoryObj } from '@storybook/react-vite';

import { Loading } from './Loading';

const meta = {
  title: 'Blocks/Loading',
  component: Loading
} satisfies Meta<typeof Loading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ position: 'relative', height: '200px', background: 'var(--color-surface)' }}>
      <Loading visible />
    </div>
  )
};

export const NoBackdrop: Story = {
  render: () => (
    <div style={{ position: 'relative', height: '200px', background: 'var(--color-surface)' }}>
      <Loading noBackdrop visible />
    </div>
  )
};

export const CustomSize: Story = {
  render: () => (
    <div style={{ position: 'relative', height: '200px', background: 'var(--color-surface)' }}>
      <Loading size={48} visible />
    </div>
  )
};
