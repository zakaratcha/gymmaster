import { expect } from '@playwright/test';
import type { Locator, Page as PlaywrightPage, Request, Route } from 'playwright';

import { Block } from '../../classes/Block';

export type ClientHubSection = 'plans' | 'splitTags';

const SECTION_URLS: Record<ClientHubSection, RegExp> = {
  plans: /\/api\/clients\/[^/]+\/plans$/,
  splitTags: /\/api\/clients\/[^/]+\/split-tags$/
};

const WORKOUT_SESSIONS_URL = /\/api\/clients\/[^/]+\/workout-sessions$/;

type SectionLoadControl = {
  failing: boolean;
  holding: boolean;
  readonly held: Route[];
};

/**
 * Управление загрузкой секций карточки между шагами сценария, пока страница открыта.
 * В dev-сборке StrictMode повторяет эффект, поэтому открытие карточки отправляет несколько запросов секции:
 * ошибка и задержка действуют на все запросы до шага повтора или завершения загрузки.
 */
const sectionLoadControls = new WeakMap<PlaywrightPage, Map<ClientHubSection, SectionLoadControl>>();

function getSectionLoadControl(page: PlaywrightPage, section: ClientHubSection): SectionLoadControl {
  const byPage = sectionLoadControls.get(page) ?? new Map<ClientHubSection, SectionLoadControl>();
  sectionLoadControls.set(page, byPage);
  const control = byPage.get(section) ?? { failing: false, holding: false, held: [] };
  byPage.set(section, control);
  return control;
}

function isPostTo(request: Request, url: RegExp): boolean {
  return request.method() === 'POST' && url.test(new URL(request.url()).pathname);
}

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
    start: '.ClientHub-Section_type_actions .ClientHub-ActionButton:has-text("Старт с плана")',
    emptyStart: '.ClientHub-Section_type_actions .ClientHub-ActionButton:has-text("Пустая сессия")',
    emptyStartDialog: 'dialog.ClientHub-EmptyStartDialog',
    split: '.ClientHub-Section_type_split',
    splitTags: '.ClientHub-Section_type_split .ClientHub-SplitTags',
    splitEmpty: '.ClientHub-Section_type_split .ClientHub-SplitEmpty',
    splitError: '.ClientHub-Section_type_split .ClientHub-SplitError',
    splitLoading: '.ClientHub-Section_type_split .ClientHub-SplitLoading',
    splitTagDialog: 'dialog.ClientHub-SplitTagDialog',
    plansError: '.ClientHub-Section_type_plan .ClientHub-PlansError',
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
        body: JSON.stringify({ error: status === 404 ? 'not_found' : 'workout_session_already_in_progress' })
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

  async openExerciseHistoryDialog(): Promise<void> {
    await this.waitForReady();
    await this.page.getByRole('button', { name: 'История упражнения…', exact: true }).click();
    const dialog = this.page.getByRole('dialog', { name: 'Выбор упражнения' });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.ClientHub-ExerciseHistoryLoading')).toHaveCount(0);
  }

  async chooseExerciseHistory(exerciseName: string): Promise<void> {
    const dialog = this.page.getByRole('dialog', { name: 'Выбор упражнения' });
    await dialog.getByRole('button', { name: exerciseName, exact: true }).first().click();
  }

  async expectExerciseHistoryChoice(exerciseName: string): Promise<void> {
    const dialog = this.page.getByRole('dialog', { name: 'Выбор упражнения' });
    await expect(dialog.getByRole('button', { name: exerciseName, exact: true }).first()).toBeVisible();
  }

  async expectExerciseHistoryChoiceAbsent(exerciseName: string): Promise<void> {
    const dialog = this.page.getByRole('dialog', { name: 'Выбор упражнения' });
    await expect(dialog.getByRole('button', { name: exerciseName, exact: true })).toHaveCount(0);
  }

  async openLatestCompletedResult(): Promise<void> {
    await this.waitForWorkoutDataReady();
    await this.findBySelector('latestWorkoutLink').click();
    await expect(this.page).toHaveURL(/\/workouts\/[^/]+\/[^/]+$/);
  }
  async failLoadsUntilRetry(section: ClientHubSection): Promise<void> {
    const control = getSectionLoadControl(this.page, section);
    control.failing = true;
    await this.page.route(SECTION_URLS[section], async route => {
      if (route.request().method() !== 'GET' || !control.failing) {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Временная ошибка сервера' })
      });
    });
  }

  async failLoads(section: ClientHubSection): Promise<void> {
    await this.page.route(SECTION_URLS[section], async route => {
      if (route.request().method() !== 'GET') {
        await route.continue();
        return;
      }

      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Временная ошибка сервера' })
      });
    });
  }

  async holdLoads(section: ClientHubSection): Promise<void> {
    const control = getSectionLoadControl(this.page, section);
    control.holding = true;
    await this.page.route(SECTION_URLS[section], async route => {
      if (route.request().method() !== 'GET' || !control.holding) {
        await route.continue();
        return;
      }

      control.held.push(route);
    });
  }

  async releaseHeldLoads(section: ClientHubSection): Promise<void> {
    const control = getSectionLoadControl(this.page, section);
    await expect.poll(() => control.held.length).toBeGreaterThan(0);
    control.holding = false;
    for (const route of control.held.splice(0)) {
      await route.continue();
    }
  }

  async retryPlans(): Promise<void> {
    const error = this.findBySelector('plansError');
    await expect(error).toContainText('Не удалось загрузить планы');
    getSectionLoadControl(this.page, 'plans').failing = false;
    await error.getByRole('button', { name: 'Повторить', exact: true }).click();
  }

  async expectStartEnabled(enabled: boolean): Promise<void> {
    await this.waitForWorkoutDataReady();
    await (enabled
      ? expect(this.findBySelector('start')).toBeEnabled()
      : expect(this.findBySelector('start')).toBeDisabled());
  }

  async expectEmptyStartEnabled(enabled: boolean): Promise<void> {
    await this.waitForWorkoutDataReady();
    await (enabled
      ? expect(this.findBySelector('emptyStart')).toBeEnabled()
      : expect(this.findBySelector('emptyStart')).toBeDisabled());
  }

  private async waitForSplitReady(): Promise<void> {
    await this.waitForVisible();
    await expect(this.findBySelector('split')).toBeVisible();
    await expect(this.findBySelector('splitLoading')).toHaveCount(0);
  }

  async expectSplitTags(tags: readonly string[]): Promise<void> {
    await this.waitForSplitReady();
    await expect(this.findBySelector('splitTags')).toHaveText(tags.join(' · '));
  }

  async expectSplitTag(tag: string): Promise<void> {
    await this.waitForSplitReady();
    const tags = this.findBySelector('splitTags');
    await expect
      .poll(async () => {
        const text = await tags.textContent();
        return text?.split(' · ') ?? [];
      })
      .toContain(tag);
  }

  async expectSplitEmpty(): Promise<void> {
    await this.waitForSplitReady();
    await expect(this.findBySelector('splitEmpty')).toHaveText('Тегов пока нет');
  }

  async expectNoSplitStubs(): Promise<void> {
    await this.waitForSplitReady();
    const split = this.findBySelector('split');
    await expect(split).not.toContainText('Скоро');
    await expect(split.getByRole('button', { name: 'Настройки сплита' })).toHaveCount(0);
    await expect(split.getByRole('button', { name: '⚙' })).toHaveCount(0);
  }

  async retrySplitTags(): Promise<void> {
    const error = this.findBySelector('splitError');
    await expect(error).toContainText('Не удалось загрузить теги');
    getSectionLoadControl(this.page, 'splitTags').failing = false;
    await error.getByRole('button', { name: 'Повторить', exact: true }).click();
  }

  private get splitTagDialog(): Locator {
    return this.findBySelector('splitTagDialog');
  }

  async openSplitTagDialog(): Promise<void> {
    await this.waitForSplitReady();
    const add = this.findBySelector('split').getByRole('button', { name: '+ тег', exact: true });
    await expect(add).toBeEnabled();
    await add.click();
    await expect(this.splitTagDialog).toBeVisible();
  }

  async fillSplitTag(tag: string): Promise<void> {
    await this.splitTagDialog.getByLabel('Тег', { exact: true }).fill(tag);
  }

  async failNextSplitTagAdd(): Promise<void> {
    let failed = false;
    await this.page.route(SECTION_URLS.splitTags, async route => {
      if (route.request().method() !== 'POST' || failed) {
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

  async submitSplitTag(status: number): Promise<void> {
    const [response] = await Promise.all([
      this.page.waitForResponse(result => isPostTo(result.request(), SECTION_URLS.splitTags)),
      this.splitTagDialog.getByRole('button', { name: 'Добавить', exact: true }).click()
    ]);
    expect(response.status()).toBe(status);
  }

  async submitSplitTagWithoutRequest(): Promise<void> {
    await this.submitWithoutRequest(SECTION_URLS.splitTags, async () => {
      await this.splitTagDialog.getByRole('button', { name: 'Добавить', exact: true }).click();
      await expect(this.splitTagDialog.locator('.Input-Error')).toBeVisible();
    });
  }

  async addSplitTag(tag: string): Promise<void> {
    await this.openSplitTagDialog();
    await this.fillSplitTag(tag);
    await this.submitSplitTag(200);
    await expect(this.splitTagDialog).toBeHidden();
  }

  async expectSplitTagDialogError(tag: string, message: string): Promise<void> {
    await expect(this.splitTagDialog).toBeVisible();
    await expect(this.splitTagDialog.getByLabel('Тег', { exact: true })).toHaveValue(tag);
    await expect(this.splitTagDialog.locator('.Input-Error')).toHaveText(message);
    await expect(this.splitTagDialog.getByRole('button', { name: 'Добавить', exact: true })).toBeEnabled();
  }

  private get emptyStartDialog(): Locator {
    return this.findBySelector('emptyStartDialog');
  }

  async openEmptyStartDialog(): Promise<void> {
    await this.waitForVisible();
    const emptyStart = this.findBySelector('emptyStart');
    await expect(emptyStart).toBeEnabled();
    await emptyStart.click();
    await expect(this.emptyStartDialog).toBeVisible();
  }

  async submitEmptyStart(status: number): Promise<void> {
    const [response] = await Promise.all([
      this.page.waitForResponse(result => isPostTo(result.request(), WORKOUT_SESSIONS_URL)),
      this.emptyStartDialog.getByRole('button', { name: 'Начать тренировку', exact: true }).click()
    ]);
    expect(response.status()).toBe(status);
  }

  async startEmptySession(): Promise<void> {
    await this.submitEmptyStart(201);
    await expect(this.page).toHaveURL(/\/workouts\/[^/]+\/[^/]+$/);
  }

  async submitEmptyStartWithoutRequest(): Promise<void> {
    await this.submitWithoutRequest(WORKOUT_SESSIONS_URL, async () => {
      await this.emptyStartDialog.getByRole('button', { name: 'Начать тренировку', exact: true }).click();
      await expect(this.emptyStartDialog.locator('.ClientHub-StartError')).toBeVisible();
    });
  }

  async expectEmptyStartError(tag: string, message: string): Promise<void> {
    await expect(this.emptyStartDialog).toBeVisible();
    await expect(this.emptyStartDialog.getByLabel('Тег дня', { exact: true })).toHaveValue(tag);
    await expect(this.emptyStartDialog.locator('.ClientHub-StartError')).toHaveText(message);
    await expect(this.emptyStartDialog.getByRole('button', { name: 'Начать тренировку', exact: true })).toBeEnabled();
  }

  private async submitWithoutRequest(url: RegExp, submit: () => Promise<void>): Promise<void> {
    let sent = 0;
    const listener = (request: Request): void => {
      if (isPostTo(request, url)) {
        sent += 1;
      }
    };

    this.page.on('request', listener);
    try {
      await submit();
    } finally {
      this.page.off('request', listener);
    }
    expect(sent).toBe(0);
  }
}
