import type { Decorator, Preview } from '@storybook/react-vite';
import type { ReactElement } from 'react';

import '../src/styles/globals.css';

const withDarkTheme: Decorator = (Story): ReactElement => (
  <div data-theme='dark' style={{ minHeight: '100vh', padding: '1.5rem' }}>
    <Story />
  </div>
);

const preview: Preview = {
  decorators: [withDarkTheme],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    backgrounds: {
      disable: true
    },
    a11y: {
      test: 'todo'
    }
  }
};

export default preview;
