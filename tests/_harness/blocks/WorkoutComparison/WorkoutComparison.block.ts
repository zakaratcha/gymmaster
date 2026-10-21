import { expect } from '@playwright/test';
import type { Locator, Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

export class WorkoutComparisonBlock extends Block {
  readonly selectors = {
    root: '.WorkoutComparison',
    title: '.WorkoutComparison-Title',
    summary: '.WorkoutComparison-Summary',
    summaryLine: '.WorkoutComparison-Summary .WorkoutComparison-Line',
    row: '.WorkoutComparison-Row',
    status: '.WorkoutComparison-Status',
    line: '.WorkoutComparison-Line',
    empty: '.WorkoutComparison-Empty'
  } as const;

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async waitForReady(): Promise<void> {
    await this.waitForVisible();
    await this.page
      .locator('.WorkoutComparison-Summary, .WorkoutComparison-Empty')
      .first()
      .waitFor({ state: 'visible' });
  }

  private rowByName(exerciseName: string): Locator {
    return this.findBySelector('row').filter({ hasText: exerciseName });
  }

  async expectRow(exerciseName: string, planText: string, factText: string): Promise<void> {
    const row = this.rowByName(exerciseName);
    await expect(row).toHaveCount(1);

    const lines = row.locator('.WorkoutComparison-Line');
    await expect(lines.nth(0)).toContainText('план');
    await expect(lines.nth(0)).toContainText(planText);
    await expect(lines.nth(1)).toContainText('факт');
    await expect(lines.nth(1)).toContainText(factText);
  }

  async expectStatus(exerciseName: string, status: string): Promise<void> {
    await expect(this.rowByName(exerciseName).locator('.WorkoutComparison-Status')).toHaveText(status);
  }

  async expectSummary(planText: string, factText: string): Promise<void> {
    const lines = this.findBySelector('summaryLine');
    await expect(lines.nth(0)).toContainText('план');
    await expect(lines.nth(0)).toContainText(planText);
    await expect(lines.nth(1)).toContainText('факт');
    await expect(lines.nth(1)).toContainText(factText);
  }

  async expectNoPlan(): Promise<void> {
    await expect(this.findBySelector('empty')).toBeVisible();
  }

  async expectFactContains(reps: number, weightKg: number): Promise<void> {
    const factLine = this.findBySelector('row').first().locator('.WorkoutComparison-Line').nth(1);
    await expect(factLine).toContainText(`${reps}×${weightKg}`);
  }
}
