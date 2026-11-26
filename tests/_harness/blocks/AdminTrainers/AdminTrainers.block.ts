import { expect } from '@playwright/test';
import type { Locator, Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

export class AdminTrainersBlock extends Block {
  readonly selectors = {
    root: '.AdminTrainers',
    create: '.AdminTrainers-Create',
    row: '.AdminTrainers-Row',
    empty: '.AdminTrainers-Empty',
    error: '.AdminTrainers-Error',
    loading: '.AdminTrainers-Loading'
  };

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  row(email: string): Locator {
    return this.page.locator(`.AdminTrainers-Row[data-email="${email}"]`);
  }

  async waitForListReady(): Promise<void> {
    await this.waitForVisible();
    const loading = this.findBySelector('loading');
    if (await loading.isVisible()) {
      await loading.waitFor({ state: 'hidden' });
    }
    await this.findBySelector('root')
      .locator('.AdminTrainers-Empty, .AdminTrainers-Row, .AdminTrainers-Error')
      .first()
      .waitFor({ state: 'visible' });
  }

  async openCreate(): Promise<void> {
    await this.findBySelector('create').click();
  }

  async expectRowStatus(email: string, label: string): Promise<void> {
    const row = this.row(email);
    await expect(row).toBeVisible();
    await expect(row).toContainText(label);
  }

  async expectEmailAbsent(email: string): Promise<void> {
    await expect(this.row(email)).toHaveCount(0);
  }

  async block(email: string): Promise<void> {
    await this.row(email).getByRole('button', { name: 'Заблокировать', exact: true }).click();
  }

  async resetPassword(email: string): Promise<void> {
    await this.row(email).getByRole('button', { name: 'Сбросить пароль', exact: true }).click();
  }
}
