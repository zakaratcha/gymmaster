import { expect } from '@playwright/test';
import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

export class LoginFormBlock extends Block {
  readonly selectors = {
    root: '.LoginForm',
    title: '.LoginForm-Title',
    loginInput: '.LoginForm-LoginField .Input-Control',
    passwordInput: '.LoginForm-PasswordField .Input-Control',
    submitButton: '.LoginForm-Submit',
    error: '.LoginForm-Error'
  };

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async login(email: string, password: string): Promise<void> {
    await this.findBySelector('loginInput').fill(email);
    await this.findBySelector('passwordInput').fill(password);
    await this.findBySelector('submitButton').click();
  }

  async expectVisible(): Promise<void> {
    await this.waitForVisible();
  }

  async expectError(expected: string): Promise<void> {
    const error = this.findBySelector('error');
    await expect(error).toBeVisible();
    await expect(error).toHaveText(expected);
  }
}
