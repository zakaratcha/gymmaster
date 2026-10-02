import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Radio } from './Radio';

const meta = {
  title: 'Blocks/Radio',
  component: Radio,
  args: {
    checked: false,
    name: 'story-radio',
    onChange: () => null,
    value: 'first',
    children: 'Первый вариант'
  }
} satisfies Meta<typeof Radio>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function Render(args) {
    const [value, setValue] = useState(args.value);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Radio {...args} checked={value === 'first'} onChange={setValue} value='first' />
        <Radio {...args} checked={value === 'second'} onChange={setValue} value='second' />
      </div>
    );
  }
};

export const WithDescription: Story = {
  args: {
    checked: true,
    children: (
      <>
        <strong>Раскладка А</strong>
        <span>3 упражнения</span>
      </>
    )
  }
};

export const Disabled: Story = {
  args: {
    checked: true,
    disabled: true
  }
};
