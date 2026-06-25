import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { ApiError } from '../../../src/services/api/api.models';
import { authClient } from '../../../src/services/auth/auth.client';
import { ensureUserCookies, resetApiSession } from '../commands/auth/apiSession';
import { loginWithJson } from '../commands/auth/loginWithJson';
import { logoutViaApi, logoutWithoutSession } from '../commands/auth/logout';
import { getTestUsernameByEmail } from '../commands/auth/testUsers';
import { requestAsAdmin, requestWithoutAuth } from '../commands/requestAs';
import type { ApiWorld } from '../world.api';

Given(
  'я авторизован в API как {string} с паролем {string}',
  async function (this: ApiWorld, email: string, _password: string) {
    const name = getTestUsernameByEmail(email);

    if (name === undefined) {
      throw new Error(`Неизвестный тестовый пользователь "${email}"`);
    }

    await ensureUserCookies(name);
  }
);

Given('я не авторизован в API', function () {
  resetApiSession();
});

When(
  'я вхожу через API с email {string} и паролем {string}',
  async function (this: ApiWorld, email: string, password: string) {
    resetApiSession();
    this.authResult = await authClient.login({ email, password });
    this.lastError = undefined;
  }
);

When('я запрашиваю текущего пользователя через API', async function (this: ApiWorld) {
  try {
    const response = await requestAsAdmin(authClient.getCurrentUser);
    this.trainer = response.trainer;
    this.lastError = undefined;
  } catch (error) {
    this.trainer = undefined;
    this.lastError = error instanceof ApiError ? error : undefined;
  }
});

When('я запрашиваю текущего пользователя через API без авторизации', async function (this: ApiWorld) {
  try {
    const response = await requestWithoutAuth(authClient.getCurrentUser);
    this.trainer = response.trainer;
    this.lastError = undefined;
  } catch (error) {
    this.trainer = undefined;
    this.lastError = error instanceof ApiError ? error : undefined;
  }
});

When('я выхожу через API', async function () {
  await logoutViaApi();
});

When('я выхожу через API без сессии', async function () {
  await logoutWithoutSession();
});

When('я вхожу через API с телом JSON:', async function (this: ApiWorld, json: string) {
  this.authResult = await loginWithJson(json);
  this.lastError = undefined;
});

Then('вход через API успешен', function (this: ApiWorld) {
  expect(this.authResult?.ok).toBe(true);
});

Then('вход через API неуспешен с ошибкой {string}', function (this: ApiWorld, error: string) {
  expect(this.authResult?.ok).toBe(false);
  if (this.authResult?.ok === false) {
    expect(this.authResult.error).toBe(error);
  }
});

Then('email текущего пользователя через API {string}', function (this: ApiWorld, email: string) {
  expect(this.trainer?.email).toBe(email);
});
