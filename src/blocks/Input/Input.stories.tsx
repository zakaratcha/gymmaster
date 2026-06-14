import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from './Input';

const meta = {
  title: 'Blocks/Input',
  component: Input,
  args: {
    id: 'demo-input',
    placeholder: 'Введите значение'
  }
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: {
    label: 'Логин'
  }
};

export const WithPlaceholder: Story = {
  args: {
    label: 'Пароль',
    placeholder: 'Введите пароль',
    type: 'password'
  }
};

export const Disabled: Story = {
  args: {
    label: 'Логин',
    disabled: true,
    defaultValue: 'trainer'
  }
};

export const WithError: Story = {
  args: {
    label: 'Логин',
    defaultValue: 'x',
    error: 'Неверный логин или пароль'
  }
};
