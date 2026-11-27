import { observer, useLocalObservable } from 'mobx-react-lite';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FC } from 'react';

import { SplitTagField, type SplitTagFieldProps } from './SplitTagField';

type SplitTagFieldStoryState = {
  value: string;
  setValue(value: string): void;
};

const SplitTagFieldStory: FC<SplitTagFieldProps> = observer(props => {
  const state = useLocalObservable<SplitTagFieldStoryState>(() => ({
    value: props.value,
    setValue(value) {
      this.value = value;
    }
  }));

  return <SplitTagField {...props} onChange={state.setValue} value={state.value} />;
});

const meta = {
  title: 'Blocks/SplitTagField',
  component: SplitTagField,
  args: {
    id: 'story-split-tag',
    label: 'Тег дня',
    placeholder: 'ноги',
    tags: ['ноги', 'верх', 'Ноги-2', 'день А'],
    value: '',
    onChange: () => null
  }
} satisfies Meta<typeof SplitTagField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => <SplitTagFieldStory {...args} />
};

export const Filtered: Story = {
  args: {
    value: 'но'
  }
};

export const EmptyPool: Story = {
  args: {
    tags: []
  }
};

export const WithError: Story = {
  args: {
    error: 'Укажите тег дня'
  }
};

export const Disabled: Story = {
  args: {
    disabled: true
  }
};
