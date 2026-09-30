import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import type { ActiveWorkoutSessionsResponse } from '../../../../src/services/workoutSessions/workoutSessions.models';
import { getBaseUrl } from '../../config/env';
import { ClientsPage } from '../../pages/Clients/Clients.page';
import type { CustomWorld } from '../../world';
import { ClientsBlock } from '../Clients/Clients.block';
import { WorkoutSessionBlock } from '../WorkoutSession/WorkoutSession.block';
import { ActiveWorkoutTabsBlock } from './ActiveWorkoutTabs.block';

async function readActiveWorkoutSessions(page: CustomWorld['page']): Promise<readonly string[]> {
  const response = await page.request.get(`${getBaseUrl()}/api/workout-sessions/active`);
  expect(response.status()).toBe(200);
  const body = (await response.json()) as ActiveWorkoutSessionsResponse;
  return body.workoutSessions.map(session => session.clientName);
}

Given('загрузка активных тренировок завершается ошибкой 500', async function (this: CustomWorld) {
  await new ActiveWorkoutTabsBlock(this.page).failLoad();
});

When('загрузка активных тренировок восстанавливается', async function (this: CustomWorld) {
  await new ActiveWorkoutTabsBlock(this.page).restoreLoad();
});

When('я открываю вкладку активной тренировки {string}', async function (this: CustomWorld, name: string) {
  const tabs = new ActiveWorkoutTabsBlock(this.page);
  await tabs.waitForVisible();
  await tabs.openTab(name);
  await new WorkoutSessionBlock(this.page).waitForReady();
});

When('я переключаюсь на главную вкладку', async function (this: CustomWorld) {
  const tabs = new ActiveWorkoutTabsBlock(this.page);
  await tabs.waitForVisible();
  await tabs.openHome();
  await tabs.expectBottomNavVisible();
});

When('я нажимаю Назад из тренировки', async function (this: CustomWorld) {
  await this.page.getByRole('link', { name: 'Вернуться в кабинет' }).click();
});

When('я перезагружаю страницу с вкладками тренировок', async function (this: CustomWorld) {
  await new ActiveWorkoutTabsBlock(this.page).reload();
  await new WorkoutSessionBlock(this.page).waitForReady();
});

When('я открываю страницу клиентов заново', async function (this: CustomWorld) {
  await new ClientsPage(this.page).open();
  await new ClientsBlock(this.page).waitForListReady();
});

Then('полоса вкладок тренировок скрыта', async function (this: CustomWorld) {
  await new ActiveWorkoutTabsBlock(this.page).waitForHidden();
});

Then('полоса вкладок тренировок содержит вкладки {string}', async function (this: CustomWorld, names: string) {
  await new ActiveWorkoutTabsBlock(this.page).waitForTabs(['Главная', ...names.split(',').map(name => name.trim())]);
});

Then('во вкладках активных тренировок есть {string}', async function (this: CustomWorld, name: string) {
  const tabs = new ActiveWorkoutTabsBlock(this.page);
  await expect(tabs.tabNames()).resolves.toContain(name);
});

Then('во вкладках активных тренировок нет {string}', async function (this: CustomWorld, name: string) {
  const tabs = new ActiveWorkoutTabsBlock(this.page);
  await expect(tabs.tabNames()).resolves.not.toContain(name);
});

Then('открыта вкладка активной тренировки {string}', async function (this: CustomWorld, name: string) {
  const tabs = new ActiveWorkoutTabsBlock(this.page);
  await expect(tabs.activeTabName()).resolves.toBe(name);
});

Then('открыта главная вкладка', async function (this: CustomWorld) {
  const tabs = new ActiveWorkoutTabsBlock(this.page);
  await expect(tabs.activeTabName()).resolves.toBe('Главная');
});

Then('нижняя навигация скрыта', async function (this: CustomWorld) {
  await new ActiveWorkoutTabsBlock(this.page).expectBottomNavHidden();
});

Then('нижняя навигация отображается', async function (this: CustomWorld) {
  await new ActiveWorkoutTabsBlock(this.page).expectBottomNavVisible();
});

Then('полоса вкладок тренировок показывает ошибку', async function (this: CustomWorld) {
  await new ActiveWorkoutTabsBlock(this.page).expectError();
});

When('я повторяю загрузку активных тренировок', async function (this: CustomWorld) {
  await new ActiveWorkoutTabsBlock(this.page).retry();
});

Then('через API есть активная тренировка клиента {string}', async function (this: CustomWorld, name: string) {
  expect(await readActiveWorkoutSessions(this.page)).toContain(name);
});

Then('через API нет активной тренировки клиента {string}', async function (this: CustomWorld, name: string) {
  expect(await readActiveWorkoutSessions(this.page)).not.toContain(name);
});
