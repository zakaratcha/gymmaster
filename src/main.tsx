import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';

import './styles/globals.css';

const el = document.querySelector('#root');
if (el === null) {
  throw new Error('#root не найден');
}

createRoot(el).render(
  <StrictMode>
    <App />
  </StrictMode>
);
