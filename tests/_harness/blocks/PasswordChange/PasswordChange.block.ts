import { expect } from '@playwright/test';
import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

export class PasswordChangeBlock extends Block {
  readonly selectors = {
    root: '.PasswordChange',
    title: '.PasswordChange-Title',
    back: '.PasswordChange-Back',
    form: '.PasswordChange-Form',
    loading: '.PasswordChange-Form .Loading',
    currentPasswordField: '.PasswordChange-CurrentPassword',
    newPasswordField: '.PasswordChange-NewPassword',
    repeatPasswordField: '.PasswordChange-RepeatPassword',
    currentPasswordInput: '.PasswordChange-CurrentPassword .Input-Control',
    newPasswordInput: '.PasswordChange-NewPassword .Input-Control',
    repeatPasswordInput: '.PasswordChange-RepeatPassword .Input-Control',
    submit: '.PasswordChange-Submit',
    error: '.PasswordChange-Error'
  };

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async expectScreen(): Promise<void> {
    await this.waitForVisible();
    await expect(this.findBySelector('title')).toHaveText('Смена пароля');
    await this.expectPasswordField('currentPasswordField', 'currentPasswordInput', 'Текущий пароль');
    await this.expectPasswordField('newPasswordField', 'newPasswordInput', 'Новый пароль');
    await this.expectPasswordField('repeatPasswordField', 'repeatPasswordInput', 'Повтор нового');
    await expect(this.findBySelector('submit')).toHaveText('Сохранить');
  }

  async fillAndSubmit(currentPassword: string, newPassword: string, repeatPassword: string): Promise<void> {
    await this.findBySelector('currentPasswordInput').fill(currentPassword);
    await this.findBySelector('newPasswordInput').fill(newPassword);
    await this.findBySelector('repeatPasswordInput').fill(repeatPassword);
    await this.findBySelector('submit').click();
    await expect(this.findBySelector('loading')).toHaveCount(0);
  }

  async expectError(expected: string): Promise<void> {
    const error = this.findBySelector('error');
    await expect(error).toBeVisible();
    await expect(error).toHaveText(expected);
  }

  async goBack(): Promise<void> {
    await this.findBySelector('back').click();
  }

  private async expectPasswordField(
    field: 'currentPasswordField' | 'newPasswordField' | 'repeatPasswordField',
    input: 'currentPasswordInput' | 'newPasswordInput' | 'repeatPasswordInput',
    label: string
  ): Promise<void> {
    await expect(this.findBySelector(field).locator('.Input-Label')).toHaveText(label);
    await expect(this.findBySelector(input)).toHaveAttribute('type', 'password');
  }
}
