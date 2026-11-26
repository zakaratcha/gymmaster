import { expect } from '@playwright/test';
import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

export class AdminTrainerCreateFormBlock extends Block {
  readonly selectors = {
    root: '.AdminTrainerCreateForm',
    title: '.AdminTrainerCreateForm-Title',
    emailInput: '.AdminTrainerCreateForm-Email .Input-Control',
    passwordInput: '.AdminTrainerCreateForm-Password .Input-Control',
    submit: '.AdminTrainerCreateForm-Submit',
    error: '.AdminTrainerCreateForm-Error'
  };

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async expectTitle(title: string): Promise<void> {
    await expect(this.findBySelector('title')).toHaveText(title);
  }

  async fillAndSubmit(email: string, password: string): Promise<void> {
    await this.findBySelector('emailInput').fill(email);
    await this.findBySelector('passwordInput').fill(password);
    await this.findBySelector('submit').click();
    await this.waitForHidden();
  }
}
