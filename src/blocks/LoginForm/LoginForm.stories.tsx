import type { Meta, StoryObj } from '@storybook/react-vite';

import { LoginForm } from './LoginForm';

const meta = {
  title: 'Blocks/LoginForm',
  component: LoginForm,
  tags: ['autodocs']
} satisfies Meta<typeof LoginForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
