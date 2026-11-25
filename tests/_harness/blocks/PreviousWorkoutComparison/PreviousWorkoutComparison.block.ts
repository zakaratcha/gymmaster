import { expect } from '@playwright/test';
import type { Locator, Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

export class PreviousWorkoutComparisonBlock extends Block {
  readonly selectors = {
    root: '.PreviousWorkoutComparison',
    header: '.PreviousWorkoutComparison-Header',
    dates: '.PreviousWorkoutComparison-Dates',
    summary: '.PreviousWorkoutComparison-Summary',
    row: '.PreviousWorkoutComparison-Row',
    empty: '.PreviousWorkoutComparison-Empty'
  } as const;

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async waitForReady(): Promise<void> {
    await this.waitForVisible();
    await this.page
      .locator('.PreviousWorkoutComparison-Summary, .PreviousWorkoutComparison-Empty, .PreviousWorkoutComparison-Error')
      .first()
      .waitFor({ state: 'visible' });
  }

  private rowByName(exerciseName: string): Locator {
    return this.findBySelector('row').filter({ hasText: exerciseName });
  }

  async expectTag(splitTag: string): Promise<void> {
    const header = this.findBySelector('header');
    await expect(header).toContainText(`Сравнение: ${splitTag}`);
    await expect(header.getByRole('link', { name: 'Вернуться к тренировке', exact: true })).toBeVisible();
  }

  async expectDates(): Promise<void> {
    const dates = this.findBySelector('dates');
    await expect(dates).toContainText(/Текущая: \d{2}\.\d{2}\.\d{4}/);
    await expect(dates).toContainText(/Прошлая: \d{2}\.\d{2}\.\d{4}/);
  }

  async expectSummary(previousVolume: string, currentVolume: string, delta: string): Promise<void> {
    const summary = this.findBySelector('summary');
    await expect(summary).toContainText('прошлая');
    await expect(summary).toContainText(previousVolume);
    await expect(summary).toContainText('текущая');
    await expect(summary).toContainText(currentVolume);
    await expect(summary).toContainText('Δ объём');
    await expect(summary).toContainText(delta);
  }

  async expectRow(exerciseName: string, previousText: string, currentText: string, delta: string): Promise<void> {
    const row = this.rowByName(exerciseName);
    await expect(row).toHaveCount(1);
    await expect(row).toContainText('прошлая');
    await expect(row).toContainText(previousText);
    await expect(row).toContainText('текущая');
    await expect(row).toContainText(currentText);
    await expect(row).toContainText('Δ объём');
    await expect(row).toContainText(delta);
  }
}
