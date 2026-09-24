import { expect } from '@playwright/test';
import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

export class ExercisesBlock extends Block {
  readonly selectors = {
    root: '.Exercises',
    title: '.Exercises-Title',
    searchInput: '.Exercises-SearchField .Input-Control',
    fab: '.Exercises-Fab',
    error: '.Exercises-Error'
  };

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async clickFab(): Promise<void> {
    await this.findBySelector('fab').click();
  }

  async search(query: string): Promise<void> {
    await this.findBySelector('searchInput').fill(query);
  }

  async getTitle(): Promise<string> {
    const title = await this.findBySelector('title').textContent();
    return title ?? '';
  }

  async waitForListReady(): Promise<void> {
    await this.waitForVisible();
    const content = this.findBySelector('root').locator('.Exercises-Content');
    const loading = content.locator('.Exercises-Loading');
    if (await loading.isVisible()) {
      await loading.waitFor({ state: 'hidden' });
    }
    await content.locator('.ExerciseList').waitFor({ state: 'visible' });
  }

  async expectRoot(): Promise<void> {
    await expect(this.findBySelector('root')).toBeVisible();
  }
}
