import { expect } from '@playwright/test';
import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

export class ExerciseFormDialogBlock extends Block {
  readonly selectors = {
    root: 'dialog.ExerciseFormDialog',
    nameInput: '.ExerciseFormDialog [name="name"]',
    notesInput: '.ExerciseFormDialog [name="notes"]',
    submitButton: '.ExerciseFormDialog-Submit',
    cancelButton: '.ExerciseFormDialog-Cancel',
    error: '.ExerciseFormDialog-Error'
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

  async fillFields(name: string, notes?: string): Promise<void> {
    await this.findBySelector('nameInput').fill(name);
    await this.findBySelector('notesInput').fill(notes ?? '');
  }

  async submit(): Promise<void> {
    await this.findBySelector('submitButton').click();
  }
}
