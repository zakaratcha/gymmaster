import { expect } from '@playwright/test';
import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

export class ExercisesBlock extends Block {
  readonly selectors = {
    root: '.Exercises',
    title: '.Exercises-Title',
    searchInput: '.Exercises-SearchField .Input-Control',
    emptyState: '.Exercises-Empty',
    exerciseRow: '.Exercises-RowName',
    exerciseRowButton: '.Exercises-Row',
    archiveButton: '.Exercises-ArchiveButton',
    archiveDialog: '.Exercises-ArchiveDialog',
    archiveConfirm: '.Exercises-ArchiveConfirm',
    archiveCancel: '.Exercises-ArchiveCancel',
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

  async getExerciseNames(): Promise<string[]> {
    const rows = this.findAllBySelector('exerciseRow');
    const texts = await rows.allTextContents();
    return texts.map(text => text.trim());
  }

  async getEmptyStateText(): Promise<string | null> {
    const empty = this.findBySelector('emptyState');
    if (!(await empty.isVisible())) {
      return null;
    }

    const text = await empty.textContent();
    return text?.trim() ?? null;
  }

  async clickExerciseByName(name: string): Promise<void> {
    await this.waitForListReady();
    await this.findBySelector('root')
      .locator(this.selectors.exerciseRowButton)
      .filter({ has: this.page.getByText(name, { exact: true }) })
      .click();
  }

  async clickArchiveByName(name: string): Promise<void> {
    await this.waitForListReady();
    await this.page.getByRole('button', { name: `Архивировать ${name}`, exact: true }).click();
    await this.findBySelector('archiveDialog').waitFor({ state: 'visible' });
  }

  async confirmArchive(): Promise<void> {
    await this.findBySelector('archiveConfirm').click();
    await this.findBySelector('archiveDialog').waitFor({ state: 'hidden' });
  }

  async waitForListReady(): Promise<void> {
    await this.waitForVisible();

    const content = this.findBySelector('root').locator('.Exercises-Content');
    const loading = content.locator('.Exercises-Loading');
    if (await loading.isVisible()) {
      await loading.waitFor({ state: 'hidden' });
    }
    await content
      .locator('.Exercises-Empty, .Exercises-RowName, .Exercises-Error')
      .first()
      .waitFor({ state: 'visible' });
  }

  async expectRoot(): Promise<void> {
    await expect(this.findBySelector('root')).toBeVisible();
  }
}
