import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { requireScenarioTrainer } from '../../commands/admin/scenarioTrainer';
import { loginWithCredentials } from '../../commands/auth/apiSession';
import { MainPage } from '../../pages/Main/Main.page';
import type { CustomWorld } from '../../world';
import { AppBlock } from '../App/App.block';
import { LoginFormBlock } from '../LoginForm/LoginForm.block';
import { ProfileBlock } from '../Profile/Profile.block';
import { ShellBlock } from '../Shell/Shell.block';
import { PasswordChangeBlock } from './PasswordChange.block';

async function openPasswordChange(page: CustomWorld['page']): Promise<void> {
  await new ShellBlock(page).openAccountTab();
  const profile = new ProfileBlock(page);
  await profile.waitForVisible();
  await profile.openPasswordChange();
  await new PasswordChangeBlock(page).waitForVisible();
}

Given('созданный тренер вошёл в приложение с паролем {string}', async function (this: CustomWorld, password: string) {
  const { email } = requireScenarioTrainer();
  await new MainPage(this.page).open();
  await new LoginFormBlock(this.page).login(email, password);
  await new AppBlock(this.page).waitForLoginOverlayHidden();
});

Given('я открыл экран смены пароля', async function (this: CustomWorld) {
  await openPasswordChange(this.page);
});

Given(
  'созданный тренер сменил на экране пароль {string} на {string}',
  async function (this: CustomWorld, currentPassword: string, newPassword: string) {
    await openPasswordChange(this.page);
    await new PasswordChangeBlock(this.page).fillAndSubmit(currentPassword, newPassword, newPassword);
    await new ProfileBlock(this.page).waitForVisible();
    await expect(this.page).toHaveURL(/\/account$/);
  }
);

Given('учётка сценария вошла на другом устройстве с паролем {string}', async function (password: string) {
  const { email } = requireScenarioTrainer();
  const result = await loginWithCredentials(email, password);
  if (!result.ok) {
    throw new Error(result.error);
  }
});

When(
  'я ввожу текущий пароль {string}, новый {string}, повтор {string} и сохраняю',
  async function (this: CustomWorld, currentPassword: string, newPassword: string, repeatPassword: string) {
    await new PasswordChangeBlock(this.page).fillAndSubmit(currentPassword, newPassword, repeatPassword);
  }
);

When('созданный тренер входит в форме входа с паролем {string}', async function (this: CustomWorld, password: string) {
  const { email } = requireScenarioTrainer();
  const loginForm = new LoginFormBlock(this.page);
  await loginForm.expectVisible();
  await loginForm.login(email, password);
});

Then('отображается экран смены пароля', async function (this: CustomWorld) {
  await new PasswordChangeBlock(this.page).expectScreen();
});

Then('экран смены пароля показывает ошибку {string}', async function (this: CustomWorld, text: string) {
  await new PasswordChangeBlock(this.page).expectError(text);
});

Then('отображается Профиль с email учётки сценария', async function (this: CustomWorld) {
  const { email } = requireScenarioTrainer();
  await new ProfileBlock(this.page).expectEmail(email);
});

Then('адрес страницы — экран смены пароля', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/account\/password$/);
});

Then('адрес страницы — Профиль', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/account$/);
});
