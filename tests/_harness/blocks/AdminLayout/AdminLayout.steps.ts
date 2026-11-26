import { After, Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { exerciseSeedNames } from '../../../../src/services/exercises/exerciseSeed.models';
import type { ActiveWorkoutSessionsResponse } from '../../../../src/services/workoutSessions/workoutSessions.models';
import {
  createScenarioTrainerEmail,
  markFinishAdminWorkouts,
  rememberScenarioTrainer,
  requireScenarioTrainer,
  takeFinishAdminWorkouts
} from '../../commands/admin/scenarioTrainer';
import { getBaseUrl } from '../../config/env';
import type { CustomWorld } from '../../world';
import { AdminLayoutBlock } from '../AdminLayout/AdminLayout.block';
import { AdminTrainerCreateFormBlock } from '../AdminTrainerCreateForm/AdminTrainerCreateForm.block';
import { AdminTrainersBlock } from '../AdminTrainers/AdminTrainers.block';
import { AdminTrainersPasswordDialogBlock } from '../AdminTrainers/AdminTrainersPasswordDialog.block';
import { AdminTrainersStatusDialogBlock } from '../AdminTrainers/AdminTrainersStatusDialog.block';
import { AppBlock } from '../App/App.block';
import { ExerciseListBlock } from '../ExerciseList/ExerciseList.block';
import { LoginFormBlock } from '../LoginForm/LoginForm.block';
import { ProfileBlock } from '../Profile/Profile.block';
import { ShellBlock } from '../Shell/Shell.block';

async function openPath(page: CustomWorld['page'], path: string): Promise<void> {
  const base = getBaseUrl();
  await page.goto(new URL(path, `${base}/`).href);
}

async function openAdmin(page: CustomWorld['page']): Promise<void> {
  await openPath(page, '/admin');
  await new AdminLayoutBlock(page).waitForVisible();
  await new AdminTrainersBlock(page).waitForListReady();
}

async function logoutToLogin(page: CustomWorld['page']): Promise<void> {
  const layout = new AdminLayoutBlock(page);
  if (await layout.isVisible()) {
    await layout.goBack();
  }

  const profile = new ProfileBlock(page);
  if (!(await profile.isVisible())) {
    await new ShellBlock(page).openAccountTab();
  }

  await profile.logout();
  await new LoginFormBlock(page).expectVisible();
}

After(async function (this: CustomWorld) {
  if (!takeFinishAdminWorkouts()) {
    return;
  }

  const base = getBaseUrl();
  const response = await this.page.request.get(`${base}/api/workout-sessions/active`);
  if (!response.ok()) {
    return;
  }

  const body = (await response.json()) as ActiveWorkoutSessionsResponse;
  await Promise.all(
    body.workoutSessions.map(async session => {
      await this.page.request.post(
        `${base}/api/clients/${encodeURIComponent(session.clientId)}/workout-sessions/${encodeURIComponent(session.id)}/complete`
      );
    })
  );
});

Given('я открыл раздел администрирования', async function (this: CustomWorld) {
  await openAdmin(this.page);
});

Given('я открыл форму {string}', async function (this: CustomWorld, title: string) {
  if (title !== 'Новый тренер') {
    throw new Error(`Неизвестная форма "${title}"`);
  }

  await openAdmin(this.page);
  await new AdminTrainersBlock(this.page).openCreate();
  await new AdminTrainerCreateFormBlock(this.page).waitForVisible();
  await new AdminTrainerCreateFormBlock(this.page).expectTitle(title);
});

Given('открыт адрес {string} без сессии', async function (this: CustomWorld, path: string) {
  await openPath(this.page, path);
  await new LoginFormBlock(this.page).expectVisible();
});

Given('активные тренировки администратора завершаются после сценария', function () {
  markFinishAdminWorkouts();
});

When('я открываю Профиль', async function (this: CustomWorld) {
  await new ShellBlock(this.page).openAccountTab();
  await new ProfileBlock(this.page).waitForVisible();
});

When('я выбираю пункт {string}', async function (this: CustomWorld, label: string) {
  await new ProfileBlock(this.page).waitForVisible();
  if (label !== 'Администрирование') {
    throw new Error(`Неизвестный пункт "${label}"`);
  }

  await new ProfileBlock(this.page).openAdmin();
});

When('я открываю раздел администрирования', async function (this: CustomWorld) {
  await openAdmin(this.page);
});

When('я открываю адрес {string}', async function (this: CustomWorld, path: string) {
  await openPath(this.page, path);
});

When('я выбираю {string}', async function (this: CustomWorld, label: string) {
  if (label !== 'Назад') {
    throw new Error(`Неизвестное действие "${label}"`);
  }

  await new AdminLayoutBlock(this.page).goBack();
});

When('я создаю тренера сценария с паролем {string}', async function (this: CustomWorld, password: string) {
  const email = createScenarioTrainerEmail();
  rememberScenarioTrainer({ email, password });
  await new AdminTrainerCreateFormBlock(this.page).fillAndSubmit(email, password);
  await new AdminTrainersBlock(this.page).waitForListReady();
});

When('созданный тренер входит в приложение', async function (this: CustomWorld) {
  const { email, password } = requireScenarioTrainer();
  await logoutToLogin(this.page);
  await new LoginFormBlock(this.page).login(email, password);
  await new AppBlock(this.page).waitForLoginOverlayHidden();
});

When('я блокирую учётку сценария с подтверждением', async function (this: CustomWorld) {
  const { email } = requireScenarioTrainer();
  const list = new AdminTrainersBlock(this.page);
  await list.block(email);
  const dialog = new AdminTrainersStatusDialogBlock(this.page);
  await dialog.waitForVisible();
  await dialog.confirm();
  await dialog.waitForHidden();
  await list.waitForListReady();
});

When('я выбираю "Заблокировать" у учётки сценария', async function (this: CustomWorld) {
  const { email } = requireScenarioTrainer();
  await new AdminTrainersBlock(this.page).block(email);
  await new AdminTrainersStatusDialogBlock(this.page).waitForVisible();
});

When('я отменяю подтверждение блокировки', async function (this: CustomWorld) {
  const dialog = new AdminTrainersStatusDialogBlock(this.page);
  await dialog.cancel();
  await dialog.waitForHidden();
});

When('я сбрасываю пароль учётки сценария на {string}', async function (this: CustomWorld, password: string) {
  const { email } = requireScenarioTrainer();
  await new AdminTrainersBlock(this.page).resetPassword(email);
  const dialog = new AdminTrainersPasswordDialogBlock(this.page);
  await dialog.waitForVisible();
  await dialog.submit(password);
});

Then('отображается раздел администрирования', async function (this: CustomWorld) {
  const layout = new AdminLayoutBlock(this.page);
  await layout.waitForVisible();
  await layout.expectTitle();
  await new AdminTrainersBlock(this.page).waitForListReady();
});

Then('в Профиле нет пункта {string}', async function (this: CustomWorld, label: string) {
  if (label !== 'Администрирование') {
    throw new Error(`Неизвестный пункт "${label}"`);
  }

  await new ProfileBlock(this.page).expectAdminHidden();
});

Then('раздел администрирования не отображается', async function (this: CustomWorld) {
  await expect(this.page.locator('.AdminLayout')).toHaveCount(0);
});

Then('отображается кабинет тренера', async function (this: CustomWorld) {
  await new ProfileBlock(this.page).waitForVisible();
  await new ShellBlock(this.page).waitForVisible();
  await expect(this.page).toHaveURL(/\/account$/);
});

Then('список учёток не содержит {string}', async function (this: CustomWorld, email: string) {
  const list = new AdminTrainersBlock(this.page);
  await list.waitForListReady();
  await list.expectEmailAbsent(email);
});

Then('список содержит учётку сценария со статусом {string}', async function (this: CustomWorld, status: string) {
  const { email } = requireScenarioTrainer();
  const list = new AdminTrainersBlock(this.page);
  await list.waitForListReady();
  await list.expectRowStatus(email, status);
});

Then('учётка сценария имеет статус {string}', async function (this: CustomWorld, status: string) {
  const { email } = requireScenarioTrainer();
  await new AdminTrainersBlock(this.page).expectRowStatus(email, status);
});

When('созданный тренер пытается войти', async function (this: CustomWorld) {
  const { email, password } = requireScenarioTrainer();
  await logoutToLogin(this.page);
  await new LoginFormBlock(this.page).login(email, password);
});

Then('справочник содержит стартовый набор упражнений', async function (this: CustomWorld) {
  const list = new ExerciseListBlock(this.page);
  await list.waitForListReady();
  const names = await list.getExerciseNames();
  for (const name of exerciseSeedNames) {
    expect(names).toContain(name);
  }
});

Then('раздел показывает временный пароль {string}', async function (this: CustomWorld, password: string) {
  await new AdminTrainersPasswordDialogBlock(this.page).expectRevealed(password);
});

When('я закрываю сообщение с временным паролем', async function (this: CustomWorld) {
  const dialog = new AdminTrainersPasswordDialogBlock(this.page);
  await dialog.close();
  await dialog.waitForHidden();
});

Then('временный пароль {string} больше не показывается', async function (this: CustomWorld, password: string) {
  await expect(this.page.getByText(password, { exact: true })).toHaveCount(0);
});
