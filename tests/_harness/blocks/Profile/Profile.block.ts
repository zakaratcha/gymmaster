import { expect } from '@playwright/test';
import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

export class ProfileBlock extends Block {
  readonly selectors = {
    root: '.Profile',
    title: '.Profile-Title',
    email: '.Profile-Email',
    logoutButton: '.Profile-Logout'
  };

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async expectEmail(expected: string): Promise<void> {
    await this.waitForVisible();
    await expect(this.findBySelector('email')).toHaveText(expected);
  }

  async logout(): Promise<void> {
    await this.findBySelector('logoutButton').click();
  }
}
