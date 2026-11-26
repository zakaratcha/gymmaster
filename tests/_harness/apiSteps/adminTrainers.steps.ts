import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { ApiError } from '../../../src/services/api/api.models';
import { exerciseSeedNames } from '../../../src/services/exercises/exerciseSeed.models';
import { requireForeignClient, requireScenarioTrainer } from '../commands/admin/scenarioTrainer';
import {
  blockOwnTrainerAccount,
  createForeignClient,
  createScenarioTrainerAsAdmin,
  createScenarioTrainerAsRoleless,
  createTrainerAsAdmin,
  listScenarioTrainerClients,
  listScenarioTrainerExercises,
  listTrainersAsAdmin,
  listTrainersAsStoredScenarioTrainer,
  listTrainersAsTrainer,
  listTrainersWithoutAuth,
  readCurrentAdmin,
  resetScenarioTrainerPassword,
  setMissingTrainerStatus,
  setScenarioTrainerStatus
} from '../commands/admin/trainers';
import { loginWithCredentials } from '../commands/auth/apiSession';
import { getClientByIdAsAdmin } from '../commands/clients/getClientById';
import type { ApiWorld } from '../world.api';

function setApiError(this: ApiWorld, error: unknown): void {
  if (error instanceof ApiError) {
    this.lastError = error;
    return;
  }

  throw error;
}

Given('создана учётка сценария с паролем {string}', async function (password: string) {
  await createScenarioTrainerAsAdmin(password);
});

Given('администратор заблокировал созданную учётку', async function () {
  await setScenarioTrainerStatus('blocked');
});

Given('администратор разблокировал созданную учётку', async function () {
  await setScenarioTrainerStatus('active');
});

Given('администратор сбросил пароль созданной учётки на {string}', async function (password: string) {
  await resetScenarioTrainerPassword(password);
});

Given('созданный тренер авторизован в API с паролем {string}', async function (password: string) {
  const { email } = requireScenarioTrainer();
  const result = await loginWithCredentials(email, password);
  if (!result.ok) {
    throw new Error(result.error);
  }
});

Given('у второго тренера есть клиент сценария', async function () {
  await createForeignClient();
});

When('я запрашиваю список учёток тренеров через API без авторизации', async function (this: ApiWorld) {
  try {
    const response = await listTrainersWithoutAuth();
    this.adminTrainers = response.trainers;
    this.lastError = undefined;
  } catch (error) {
    this.adminTrainers = undefined;
    setApiError.call(this, error);
  }
});

When('я запрашиваю список учёток тренеров через API от имени тренера без роли', async function (this: ApiWorld) {
  try {
    const response = await listTrainersAsTrainer();
    this.adminTrainers = response.trainers;
    this.lastError = undefined;
  } catch (error) {
    this.adminTrainers = undefined;
    setApiError.call(this, error);
  }
});

When('тренер без роли создаёт учётку сценария с паролем {string}', async function (this: ApiWorld, password: string) {
  try {
    this.adminTrainer = await createScenarioTrainerAsRoleless(password);
    this.lastError = undefined;
  } catch (error) {
    this.adminTrainer = undefined;
    setApiError.call(this, error);
  }
});

When('я создаю учётку сценария через API с паролем {string}', async function (this: ApiWorld, password: string) {
  try {
    this.adminTrainer = await createScenarioTrainerAsAdmin(password);
    this.lastError = undefined;
  } catch (error) {
    this.adminTrainer = undefined;
    setApiError.call(this, error);
  }
});

When(
  'я создаю учётку сценария через API с паролем {string} и ролью platform_admin',
  async function (this: ApiWorld, password: string) {
    try {
      this.adminTrainer = await createScenarioTrainerAsAdmin(password, { roles: ['platform_admin'], admin: 1 });
      this.lastError = undefined;
    } catch (error) {
      this.adminTrainer = undefined;
      setApiError.call(this, error);
    }
  }
);

When(
  'я создаю учётку через API с email {string} и паролем {string}',
  async function (this: ApiWorld, email: string, password: string) {
    try {
      this.adminTrainer = await createTrainerAsAdmin(email, password);
      this.lastError = undefined;
    } catch (error) {
      this.adminTrainer = undefined;
      setApiError.call(this, error);
    }
  }
);

When('я вхожу через API как созданный тренер с паролем {string}', async function (this: ApiWorld, password: string) {
  const { email } = requireScenarioTrainer();
  this.authResult = await loginWithCredentials(email, password);
  this.lastError = undefined;
});

When('я запрашиваю список учёток тренеров через API', async function (this: ApiWorld) {
  try {
    const response = await listTrainersAsAdmin();
    this.adminTrainers = response.trainers;
  } catch (error) {
    this.adminTrainers = undefined;
    setApiError.call(this, error);
  }
});

When('я запрашиваю список учёток тренеров через API от имени созданного тренера', async function (this: ApiWorld) {
  try {
    const response = await listTrainersAsStoredScenarioTrainer();
    this.adminTrainers = response.trainers;
    this.lastError = undefined;
  } catch (error) {
    this.adminTrainers = undefined;
    setApiError.call(this, error);
  }
});

When('созданный тренер запрашивает список упражнений через API', async function (this: ApiWorld) {
  try {
    this.exercises = await listScenarioTrainerExercises();
    this.lastError = undefined;
  } catch (error) {
    this.exercises = undefined;
    setApiError.call(this, error);
  }
});

When('созданный тренер запрашивает список клиентов через API', async function (this: ApiWorld) {
  try {
    this.clients = await listScenarioTrainerClients();
    this.lastError = undefined;
  } catch (error) {
    this.clients = undefined;
    setApiError.call(this, error);
  }
});

When('я блокирую собственную учётку через API', async function (this: ApiWorld) {
  try {
    await blockOwnTrainerAccount();
    this.lastError = undefined;
  } catch (error) {
    setApiError.call(this, error);
  }
});

When('я проверяю текущего пользователя через API', async function (this: ApiWorld) {
  this.trainer = await readCurrentAdmin();
});

When('я меняю статус несуществующей учётки на {string}', async function (this: ApiWorld, status: string) {
  if (status !== 'active' && status !== 'blocked') {
    throw new Error(`Неизвестный статус "${status}"`);
  }

  try {
    this.adminTrainer = await setMissingTrainerStatus(status);
    this.lastError = undefined;
  } catch (error) {
    this.adminTrainer = undefined;
    setApiError.call(this, error);
  }
});

When('я запрашиваю клиента второго тренера по идентификатору через API', async function (this: ApiWorld) {
  const client = requireForeignClient();

  try {
    this.client = await getClientByIdAsAdmin(client.id);
    this.lastError = undefined;
  } catch (error) {
    this.client = undefined;
    setApiError.call(this, error);
  }
});

Then('созданная учётка активна', function (this: ApiWorld) {
  const trainer = requireScenarioTrainer();
  expect(this.lastError).toBeUndefined();
  expect(this.adminTrainer?.email).toBe(trainer.email);
  expect(this.adminTrainer?.status).toBe('active');
});

Then('у вошедшего тренера только роль тренера', function (this: ApiWorld) {
  expect(this.authResult?.ok).toBe(true);
  if (this.authResult?.ok === true) {
    expect(this.authResult.trainer.roles).toEqual(['trainer']);
  }
});

Then('список упражнений через API содержит стартовый набор', function (this: ApiWorld) {
  expect(this.lastError).toBeUndefined();
  const names = this.exercises?.map(exercise => exercise.name) ?? [];
  expect(names).toHaveLength(exerciseSeedNames.length);
  for (const name of exerciseSeedNames) {
    expect(names).toContain(name);
  }
});

Then('список учёток через API не содержит email сценария', function (this: ApiWorld) {
  const { email } = requireScenarioTrainer();
  expect(this.adminTrainers?.some(trainer => trainer.email === email)).toBe(false);
});

Then('список учёток через API не содержит {string}', function (this: ApiWorld, email: string) {
  expect(this.adminTrainers?.some(trainer => trainer.email === email)).toBe(false);
});

Then('в списке через API одна учётка с email {string}', function (this: ApiWorld, email: string) {
  const matches = this.adminTrainers?.filter(trainer => trainer.email === email) ?? [];
  expect(matches).toHaveLength(1);
});

Then('текущий пользователь по-прежнему авторизован', function (this: ApiWorld) {
  expect(this.trainer?.email).toBe('first-admin@local');
  expect(this.trainer?.status).toBe('active');
});

Then('список клиентов администратора не содержит клиента второго тренера', function (this: ApiWorld) {
  const client = requireForeignClient();
  expect(this.clients?.some(item => item.name === client.name || item.id === client.id)).toBe(false);
});
