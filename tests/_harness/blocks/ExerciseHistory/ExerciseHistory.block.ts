import { expect } from '@playwright/test';
import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

const historyUrl = /\/api\/clients\/[^/]+\/exercise-history\/[^/]+$/;

export class ExerciseHistoryBlock extends Block {
  readonly selectors = {
    root: '.ExerciseHistory',
    title: '.ExerciseHistory-Header h1',
    close: '.ExerciseHistory-Header button',
    row: '.ExerciseHistory-Row',
    empty: '.ExerciseHistory-Empty',
    error: '.ExerciseHistory-Error',
    retry: '.ExerciseHistory-Error button',
    loading: '.ExerciseHistory-Loading'
  } as const;

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async waitForReady(): Promise<void> {
    await this.waitForVisible();
    const loading = this.findBySelector('loading');
    if (await loading.count()) {
      await loading.waitFor({ state: 'hidden' });
    }

    await this.page
      .locator('.ExerciseHistory-Header h1, .ExerciseHistory-Empty, .ExerciseHistory-Error')
      .first()
      .waitFor({ state: 'visible' });
  }

  async expectTitle(title: string): Promise<void> {
    await expect(this.findBySelector('title')).toHaveText(title);
  }

  async expectDatedSets(setsText: string): Promise<void> {
    const row = this.findBySelector('row').filter({ hasText: setsText });
    await expect(row).toHaveCount(1);
    await expect(row).toHaveText(/\d{2}\.\d{2}\.\d{4}/);
  }

  async expectEmpty(text: string): Promise<void> {
    await expect(this.findBySelector('empty')).toHaveText(text);
  }

  async expectError(): Promise<void> {
    await expect(this.findBySelector('error')).toBeVisible();
    await expect(this.findBySelector('retry')).toHaveText('Повторить');
    await expect(this.findBySelector('retry')).toBeEnabled();
  }

  async failLoad(): Promise<void> {
    await this.page.route(historyUrl, async route => {
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

  async retry(): Promise<void> {
    await this.page.unroute(historyUrl);
    const response = this.page.waitForResponse(result => {
      const url = new URL(result.url());
      return result.request().method() === 'GET' && historyUrl.test(url.pathname);
    });
    const [loaded] = await Promise.all([response, this.findBySelector('retry').click()]);
    expect(loaded.status()).toBe(200);
    await this.waitForReady();
  }

  async close(): Promise<void> {
    await this.findBySelector('close').click();
    await expect(this.page.getByRole('dialog', { name: 'История упражнения' })).toHaveCount(0);
  }
}
