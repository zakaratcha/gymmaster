import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

export class ExerciseListBlock extends Block {
  readonly selectors = {
    root: '.ExerciseList',
    emptyState: '.ExerciseList-Empty',
    exerciseRow: '.ExerciseList-RowName',
    exerciseRowButton: '.ExerciseList-Row'
  };

  constructor(page: PlaywrightPage) {
    super(page, null);
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
  }

  async waitForListReady(): Promise<void> {
    await this.waitForVisible();
    await this.findBySelector('root')
      .locator('.ExerciseList-Empty, .ExerciseList-RowName')
      .first()
      .waitFor({ state: 'visible' });
  }
}
