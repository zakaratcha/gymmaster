import { expect } from '@playwright/test';
import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';
import { ShellBlock } from '../Shell/Shell.block';

export class ProfileBlock extends Block {
  readonly selectors = {
    root: '.Profile',
    title: '.Profile-Title',
    email: '.Profile-Email',
    logoutButton: '.Profile-Logout',
    adminLink: '.Profile-Admin',
    passwordChangeLink: '.Profile-PasswordChange'
  };

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async expectEmail(expected: string): Promise<void> {
    await this.waitForVisible();
    await expect(this.findBySelector('email')).toHaveText(expected);
  }

  async openAdmin(): Promise<void> {
    await this.findBySelector('adminLink').click();
  }

  async openPasswordChange(): Promise<void> {
    await this.findBySelector('passwordChangeLink').click();
  }

  async expectAdminVisible(): Promise<void> {
    await expect(this.findBySelector('adminLink')).toBeVisible();
  }

  async expectAdminHidden(): Promise<void> {
    await expect(this.findBySelector('adminLink')).toHaveCount(0);
  }

  async logout(): Promise<void> {
    await this.findBySelector('logoutButton').click();
  }

  async logoutFromHome(): Promise<void> {
    const shell = new ShellBlock(this.page);
    await shell.openAccountTab();
    await this.waitForVisible();
    await this.logout();
  }
}
