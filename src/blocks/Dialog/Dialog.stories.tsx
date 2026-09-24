import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../Button/Button';
import { DialogActions } from './Actions/Dialog-Actions';
import { DialogContent } from './Content/Dialog-Content';
import { Dialog } from './Dialog';
import { DialogTitle } from './Title/Dialog-Title';

const meta = {
  title: 'Blocks/Dialog',
  component: Dialog,
  args: {
    ariaLabel: 'Диалог',
    children: 'Содержимое диалога',
    onCancel: () => null
  }
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => (
    <Dialog {...args}>
      <DialogTitle>Заголовок диалога</DialogTitle>
      <DialogContent>
        <p>Текст диалога</p>
      </DialogContent>
      <DialogActions>
        <Button>Отмена</Button>
        <Button color='primary'>Подтвердить</Button>
      </DialogActions>
    </Dialog>
  )
};

export const WithError: Story = {
  render: args => (
    <Dialog {...args}>
      <DialogTitle>Ошибка</DialogTitle>
      <DialogContent>
        <p role='alert'>Не удалось выполнить действие</p>
      </DialogContent>
      <DialogActions>
        <Button color='primary'>Закрыть</Button>
      </DialogActions>
    </Dialog>
  )
};
