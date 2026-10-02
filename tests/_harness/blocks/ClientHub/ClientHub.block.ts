import { expect } from '@playwright/test';
import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

export class ClientHubBlock extends Block {
  readonly selectors = {
    root: '.ClientHub',
    title: '.ClientHub-Title',
    back: '.ClientHub-Back',
    edit: '.ClientHub-Edit',
    delete: '.ClientHub-Delete',
    deleteDialog: 'dialog.ClientHub-DeleteDialog',
    deleteConfirm: '.ClientHub-DeleteConfirm',
    deleteCancel: '.ClientHub-DeleteCancel',
    deleteError: '.ClientHub-DeleteError',
    loading: '.ClientHub-Loading',
    bodyWeight: '.ClientHub-BodyWeight',
    notesPreview: '.ClientHub-NotesPreview',
    sectionTitle: '.ClientHub-SectionTitle',
    allPlans: '.ClientHub-Section_type_plan .ClientHub-StubAction',
    planRow: '.ClientHub-PlanRow',
    start: '.ClientHub-Section_type_actions .ClientHub-ActionButton',
    startDialog: 'dialog.ClientHub-StartDialog',
    startDialogError: '.ClientHub-StartError',
    planOption: '.ClientHub-PlanOption',
    activeWorkout: '.ClientHub-ActiveWorkoutContent',
    activeWorkoutTag: '.ClientHub-ActiveWorkoutTag',
    activeWorkoutOpen: '.ClientHub-OpenWorkout',
    latestWorkout: '.ClientHub-LatestWorkoutContent',
    latestWorkoutTag: '.ClientHub-LatestWorkoutTag',
    latestWorkoutStats: '.ClientHub-LatestWorkoutStats',
    latestWorkoutLink: '.ClientHub-LatestWorkoutLink',
    error: '.ClientHub-Error'
  };

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async waitForReady(): Promise<void> {
    await this.waitForVisible();

    const loading = this.findBySelector('loading');
    if (await loading.isVisible()) {
      await loading.waitFor({ state: 'hidden' });
    }

    await this.findBySelector('bodyWeight').or(this.findBySelector('error')).first().waitFor({ state: 'visible' });
  }

  async expectTitle(title: string): Promise<void> {
    await expect(this.findBySelector('title')).toHaveText(title);
  }

  async expectBodyWeight(weight: string): Promise<void> {
    await expect(this.findBySelector('bodyWeight')).toContainText(weight);
  }

  async expectNotes(notes: string): Promise<void> {
    await expect(this.findBySelector('notesPreview')).toHaveText(notes);
  }

  async clickEdit(): Promise<void> {
    await this.findBySelector('edit').click();
  }

  async clickDelete(): Promise<void> {
    await this.findBySelector('delete').click();
  }

  async expectDeleteDialog(): Promise<void> {
    await expect(this.findBySelector('deleteDialog')).toBeVisible();
    await expect(this.findBySelector('deleteDialog')).toHaveJSProperty('open', true);
  }

  async expectDeleteDialogHidden(): Promise<void> {
    await expect(this.findBySelector('deleteDialog')).toBeHidden();
  }

  async cancelDelete(): Promise<void> {
    await this.findBySelector('deleteCancel').click();
    await this.expectDeleteDialogHidden();
  }

  async confirmDelete(): Promise<void> {
    await this.findBySelector('deleteConfirm').click();
  }

  async expectDeleteError(): Promise<void> {
    await this.expectDeleteDialog();
    await expect(this.findBySelector('deleteError')).toBeVisible();
    await expect(this.findBySelector('deleteError')).toHaveText(/\S/);
    await expect(this.findBySelector('deleteConfirm')).toBeEnabled();
  }

  async submitMutation(method: 'PATCH' | 'DELETE', status: number, submit: () => Promise<void>): Promise<void> {
    const url = new URL(this.page.url());
    url.pathname = `/api${url.pathname}`;
    url.search = '';
    url.hash = '';

    const [response] = await Promise.all([
      this.page.waitForResponse(result => result.url() === url.href && result.request().method() === method),
      submit()
    ]);
    expect(response.status()).toBe(status);
    expect(await response.finished()).toBeNull();
  }

  async failNextMutation(method: 'PATCH' | 'DELETE'): Promise<void> {
    const url = new URL(this.page.url());
    url.pathname = `/api${url.pathname}`;
    url.search = '';
    url.hash = '';
    let failed = false;

    await this.page.route(url.toString(), async route => {
      if (route.request().method() !== method || failed) {
        await route.continue();
        return;
      }

      failed = true;
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Временная ошибка сервера' })
      });
    });
  }

  async clickBack(): Promise<void> {
    await this.findBySelector('back').click();
  }

  async clickAllPlans(): Promise<void> {
    await this.findBySelector('allPlans').click();
  }

  async expectNearestPlan(text: string): Promise<void> {
    await expect(this.findBySelector('planRow')).toContainText(text);
  }

  async waitForWorkoutDataReady(): Promise<void> {
    await this.waitForVisible();
    await expect(this.page.locator('.ClientHub-PlansLoading, .ClientHub-SessionsLoading')).toHaveCount(0);
    await expect(
      this.page.locator(
        '.ClientHub-PlanRow, .ClientHub-Section_type_plan .ClientHub-StubText, .ClientHub-Section_type_plan .ClientHub-PlansError'
      )
    ).toBeVisible();
    await expect(
      this.page.locator(
        '.ClientHub-LatestWorkoutContent, .ClientHub-Section_type_latestWorkout .ClientHub-StubText, .ClientHub-Section_type_latestWorkout .ClientHub-SessionsError'
      )
    ).toBeVisible();
  }

  async openStartDialog(splitTag: string): Promise<void> {
    await this.waitForWorkoutDataReady();
    await this.findBySelector('start').click();
    await expect(this.findBySelector('startDialog')).toBeVisible();
    const planOption = this.findBySelector('startDialog')
      .locator('.ClientHub-PlanOption')
      .filter({ hasText: splitTag });
    await expect(planOption).toHaveCount(1);
    await planOption.locator('input[type="radio"]').check();
  }

  async failNextStart(status: number): Promise<void> {
    await this.page.route(/\/api\/clients\/[^/]+\/workout-sessions$/, async route => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }

      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'workout_session_already_in_progress' })
      });
    });
  }

  async submitStart(status: number): Promise<void> {
    const response = this.page.waitForResponse(result => {
      const url = new URL(result.url());
      return result.request().method() === 'POST' && /\/api\/clients\/[^/]+\/workout-sessions$/.test(url.pathname);
    });

    const [created] = await Promise.all([
      response,
      this.findBySelector('startDialog').getByRole('button', { name: 'Начать тренировку', exact: true }).click()
    ]);
    expect(created.status()).toBe(status);
  }

  async expectStartError(message: string): Promise<void> {
    await expect(this.findBySelector('startDialog')).toBeVisible();
    await expect(this.findBySelector('startDialogError')).toBeVisible();
    await expect(this.findBySelector('startDialogError')).toHaveText(message);
    const startButton = this.findBySelector('startDialog').getByRole('button', { name: 'Начать тренировку' });
    await expect(startButton).toBeEnabled();
  }

  async waitForActiveWorkout(): Promise<void> {
    await this.waitForWorkoutDataReady();
    await expect(this.findBySelector('activeWorkout')).toBeVisible();
  }

  async expectActiveWorkout(splitTag: string): Promise<void> {
    await this.waitForActiveWorkout();
    await expect(this.findBySelector('activeWorkoutTag')).toHaveText(splitTag);
  }

  async openActiveWorkout(): Promise<void> {
    await this.waitForActiveWorkout();
    await this.findBySelector('activeWorkoutOpen').click();
    await expect(this.page).toHaveURL(/\/workouts\/[^/]+\/[^/]+$/);
  }

  async startPlan(splitTag: string): Promise<void> {
    await this.openStartDialog(splitTag);

    const responsePromise = this.page.waitForResponse(response => {
      const url = new URL(response.url());
      return response.request().method() === 'POST' && /\/api\/clients\/[^/]+\/workout-sessions$/.test(url.pathname);
    });
    await this.findBySelector('startDialog').getByRole('button', { name: 'Начать тренировку', exact: true }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(201);
    await expect(this.page).toHaveURL(/\/workouts\/[^/]+\/[^/]+$/);
  }

  async expectLatestCompleted(splitTag: string, stats: string): Promise<void> {
    await this.waitForWorkoutDataReady();
    await expect(this.findBySelector('latestWorkout')).toBeVisible();
    await expect(this.findBySelector('latestWorkoutTag')).toHaveText(splitTag);
    await expect(this.findBySelector('latestWorkoutStats')).toHaveText(stats);
  }

  async openLatestCompletedResult(): Promise<void> {
    await this.waitForWorkoutDataReady();
    await this.findBySelector('latestWorkoutLink').click();
    await expect(this.page).toHaveURL(/\/workouts\/[^/]+\/[^/]+$/);
  }
}
