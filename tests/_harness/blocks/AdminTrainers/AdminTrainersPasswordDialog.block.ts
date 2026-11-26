import { expect } from '@playwright/test';
import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

export class AdminTrainersPasswordDialogBlock extends Block {
  readonly selectors = {
    root: '.AdminTrainers-PasswordDialog',
    passwordInput: '.AdminTrainers-PasswordDialog .Input-Control'
  };

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async submit(password: string): Promise<void> {
    await this.findBySelector('passwordInput').fill(password);
    await this.findBySelector('root').getByRole('button', { name: 'Сбросить пароль', exact: true }).click();
  }

  async expectRevealed(password: string): Promise<void> {
    await expect(this.findBySelector('root').getByText(password, { exact: true })).toBeVisible();
  }

  async close(): Promise<void> {
    await this.findBySelector('root').getByRole('button', { name: 'Закрыть', exact: true }).click();
  }
}
