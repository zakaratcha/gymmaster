import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { readApiErrorMessage } from '../utils/apiError';
import type { ApiWorld } from '../world.api';

Then('API возвращает ошибку {int}', function (this: ApiWorld, status: number) {
  expect(this.lastError).toBeDefined();
  expect(this.lastError?.status).toBe(status);
});

Then('API возвращает ошибку {int} с текстом {string}', function (this: ApiWorld, status: number, message: string) {
  expect(this.lastError).toBeDefined();
  expect(this.lastError?.status).toBe(status);
  expect(readApiErrorMessage(this.lastError?.body)).toBe(message);
});
