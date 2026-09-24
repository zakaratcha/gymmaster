import { expect } from '@playwright/test';
import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

export class ExerciseFormBlock extends Block {
  readonly selectors = {
    root: 'dialog.Dialog',
    nameInput: '.ExerciseForm [name="name"]',
    notesInput: '.ExerciseForm [name="notes"]',
    submitButton: '.ExerciseForm-Submit',
    cancelButton: '.ExerciseForm-Cancel',
    error: '.ExerciseForm-Error'
  };

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async expectCreateDialog(): Promise<void> {
    await this.waitForVisible();
    await expect(this.findBySelector('root')).toHaveJSProperty('open', true);
    await expect(this.findBySelector('root')).toHaveAccessibleName('Новое упражнение');
  }

  async expectEditDialog(): Promise<void> {
    await this.waitForVisible();
    await expect(this.findBySelector('root')).toHaveJSProperty('open', true);
    await expect(this.findBySelector('root')).toHaveAccessibleName('Редактирование упражнения');
  }

  async expectValues(name: string, notes: string): Promise<void> {
    await expect(this.findBySelector('nameInput')).toHaveValue(name);
    await expect(this.findBySelector('notesInput')).toHaveValue(notes);
  }

  async fillFields(name: string, notes?: string): Promise<void> {
    await this.findBySelector('nameInput').fill(name);
    await this.findBySelector('notesInput').fill(notes ?? '');
  }

  async submit(): Promise<void> {
    await this.findBySelector('submitButton').click();
  }

  async cancel(): Promise<void> {
    await this.findBySelector('cancelButton').click();
    await this.waitForHidden();
  }

  async expectError(): Promise<void> {
    await expect(this.findBySelector('error')).toBeVisible();
    await expect(this.findBySelector('error')).toHaveText(/\S/);
  }
}
