import { ChevronRightIcon, PlusIcon } from '@radix-ui/react-icons';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './Button';

const meta = {
  title: 'Blocks/Button',
  component: Button,
  args: {
    children: 'Кнопка'
  }
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Primary: Story = {
  args: {
    color: 'primary'
  }
};

export const Secondary: Story = {
  args: {
    color: 'secondary'
  }
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
      <Button disabled>Default</Button>
      <Button color='primary' disabled>
        Primary
      </Button>
      <Button color='secondary' disabled>
        Secondary
      </Button>
    </div>
  )
};

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
      <Button color='primary' startIcon={<PlusIcon />}>
        Добавить
      </Button>
      <Button color='secondary' endIcon={<ChevronRightIcon />}>
        Далее
      </Button>
      <Button endIcon={<ChevronRightIcon />} startIcon={<PlusIcon />}>
        Создать и открыть
      </Button>
      <Button disabled endIcon={<ChevronRightIcon />} startIcon={<PlusIcon />}>
        Недоступно
      </Button>
    </div>
  )
};

export const AsChild: Story = {
  args: {
    asChild: true,
    color: 'primary'
  },
  render: args => (
    <Button {...args}>
      <a href='/'>Ссылка-кнопка</a>
    </Button>
  )
};
