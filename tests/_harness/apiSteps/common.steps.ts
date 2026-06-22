import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import type { ApiWorld } from '../world.api';

Then('API возвращает ошибку {int}', function (this: ApiWorld, status: number) {
  expect(this.lastError).toBeDefined();
  expect(this.lastError?.status).toBe(status);
});
