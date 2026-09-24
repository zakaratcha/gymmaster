import { expect } from '@playwright/test';
import type { Page as PlaywrightPage } from 'playwright';

import { Page } from '../../classes/Page';

export class PlannedWorkoutListPage extends Page {
  readonly title = 'Планы';
  readonly url = '/clients';
  readonly selectors = {
    root: '.PlannedWorkoutList',
    title: '.PlannedWorkoutList-Title',
    list: '.PlannedWorkoutList-List',
    empty: '.PlannedWorkoutList-Empty',
    create: '.PlannedWorkoutList-Create',
    deleteDialog: 'dialog.PlannedWorkoutList-DeleteDialog'
  } as const;

  constructor(page: PlaywrightPage) {
    super(page);
  }

  override async open(clientId: string): Promise<void> {
    await super.open(`/${clientId}/plans`);
    await this.waitForReady();
  }

  async waitForReady(): Promise<void> {
    await this.waitForVisible();
    await this.page
      .locator('.PlannedWorkoutList-List, .PlannedWorkoutList-Empty, .PlannedWorkoutList-ErrorBlock')
      .first()
      .waitFor();
  }

  async expectPlan(splitTag: string): Promise<void> {
    await expect(this.findBySelector('root')).toContainText(splitTag);
  }

  async clickBack(): Promise<void> {
    await this.page.locator('.PlannedWorkoutList-Back').click();
  }

  async expectEmpty(): Promise<void> {
    await expect(this.findBySelector('empty')).toContainText('Нет предстоящих планов');
  }

  async clickCreate(): Promise<void> {
    await this.findBySelector('create').first().click();
  }

  async openPlanByTag(splitTag: string): Promise<void> {
    await this.findBySelector('root').locator('.PlannedWorkoutList-Row').filter({ hasText: splitTag }).click();
  }

  async deletePlanByTag(splitTag: string): Promise<void> {
    await this.page.getByRole('button', { name: `Удалить план ${splitTag}`, exact: true }).click();
    await expect(this.findBySelector('deleteDialog')).toBeVisible();
    await this.page.getByRole('button', { name: 'Удалить', exact: true }).last().click();
  }
}
