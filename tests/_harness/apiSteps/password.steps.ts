import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { ApiError } from '../../../src/services/api/api.models';
import type { Trainer } from '../../../src/services/trainers/trainers.models';
import { requireScenarioTrainer, requireSecondScenarioTrainer } from '../commands/admin/scenarioTrainer';
import { createSecondScenarioTrainerAsAdmin } from '../commands/admin/trainers';
import { loginWithCredentials } from '../commands/auth/apiSession';
import {
  changePasswordWithoutSession,
  changePasswordWithoutSessionWithJson,
  changeScenarioTrainerPassword,
  changeScenarioTrainerPasswordWithJson,
  changeScenarioTrainerPasswordWithSecondTrainerIds,
  readScenarioTrainerWithRememberedSession,
  readScenarioTrainerWithResponseSession,
  rememberScenarioTrainerSession
} from '../commands/auth/changePassword';
import { readApiErrorMessage } from '../utils/apiError';
import type { ApiWorld } from '../world.api';

async function recordPasswordChange(this: ApiWorld, change: () => Promise<void>): Promise<void> {
  try {
    await change();
    this.passwordChangeError = undefined;
  } catch (error) {
    if (!(error instanceof ApiError)) {
      throw error;
    }

    this.passwordChangeError = error;
  }
}

async function recordCurrentUser(this: ApiWorld, read: () => Promise<Trainer>): Promise<void> {
  try {
    this.trainer = await read();
    this.lastError = undefined;
  } catch (error) {
    if (!(error instanceof ApiError)) {
      throw error;
    }

    this.trainer = undefined;
    this.lastError = error;
  }
}

Given('создана вторая учётка сценария с паролем {string}', async function (password: string) {
  await createSecondScenarioTrainerAsAdmin(password);
});

Given('запомнена сессия созданного тренера, выданная при входе', function () {
  rememberScenarioTrainerSession();
});

When(
  'созданный тренер меняет пароль через API с {string} на {string}',
  async function (this: ApiWorld, currentPassword: string, newPassword: string) {
    await recordPasswordChange.call(this, () => changeScenarioTrainerPassword(currentPassword, newPassword));
  }
);

When(
  'созданный тренер меняет пароль через API с {string} на {string}, указав идентификатор и email второй учётки',
  async function (this: ApiWorld, currentPassword: string, newPassword: string) {
    await changeScenarioTrainerPasswordWithSecondTrainerIds(currentPassword, newPassword);
    this.passwordChangeError = undefined;
  }
);

When('созданный тренер отправляет смену пароля через API с телом JSON:', async function (this: ApiWorld, json: string) {
  await recordPasswordChange.call(this, () => changeScenarioTrainerPasswordWithJson(json));
});

When(
  'я отправляю смену пароля через API без сессии с {string} на {string}',
  async function (this: ApiWorld, currentPassword: string, newPassword: string) {
    await recordPasswordChange.call(this, () => changePasswordWithoutSession(currentPassword, newPassword));
  }
);

When('я отправляю смену пароля через API без сессии с телом JSON:', async function (this: ApiWorld, json: string) {
  await recordPasswordChange.call(this, () => changePasswordWithoutSessionWithJson(json));
});

When('созданный тренер запрашивает текущего пользователя через API в той же сессии', async function (this: ApiWorld) {
  await recordCurrentUser.call(this, readScenarioTrainerWithRememberedSession);
});

When(
  'созданный тренер запрашивает текущего пользователя через API с сессией из ответа на смену',
  async function (this: ApiWorld) {
    await recordCurrentUser.call(this, readScenarioTrainerWithResponseSession);
  }
);

When(
  'созданный тренер запрашивает текущего пользователя через API с запомненной сессией',
  async function (this: ApiWorld) {
    await recordCurrentUser.call(this, readScenarioTrainerWithRememberedSession);
  }
);

When('вторая учётка сценария входит через API с паролем {string}', async function (this: ApiWorld, password: string) {
  const { email } = requireSecondScenarioTrainer();
  this.authResult = await loginWithCredentials(email, password);
  this.lastError = undefined;
});

Then('смена пароля через API отклонена с ошибкой {int}', function (this: ApiWorld, status: number) {
  expect(this.passwordChangeError).toBeDefined();
  expect(this.passwordChangeError?.status).toBe(status);
});

Then(
  'смена пароля через API отклонена с ошибкой {int} и текстом {string}',
  function (this: ApiWorld, status: number, message: string) {
    expect(this.passwordChangeError).toBeDefined();
    expect(this.passwordChangeError?.status).toBe(status);
    expect(readApiErrorMessage(this.passwordChangeError?.body)).toBe(message);
  }
);

Then('запрос текущего пользователя через API успешен', function (this: ApiWorld) {
  const { email } = requireScenarioTrainer();
  expect(this.lastError).toBeUndefined();
  expect(this.trainer?.email).toBe(email);
});
