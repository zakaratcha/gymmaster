import { expect } from '@playwright/test';
import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

type FillAndSubmitOptions = {
  readonly name: string;
  readonly notes?: string;
  readonly weight?: number | string;
};

export class ClientCreateFormBlock extends Block {
  readonly selectors = {
    root: 'dialog.ClientCreateForm',
    nameInput: '.ClientCreateForm [name="name"]',
    notesInput: '.ClientCreateForm [name="notes"]',
    weightInput: '.ClientCreateForm [name="bodyWeightKg"]',
    submitButton: '.ClientCreateForm-Submit',
    cancelButton: '.ClientCreateForm-Cancel',
    error: '.ClientCreateForm-Error'
  };

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async expectEditDialog(): Promise<void> {
    await this.waitForVisible();
    await expect(this.findBySelector('root')).toHaveJSProperty('open', true);
    await expect(this.findBySelector('root')).toHaveAccessibleName('Редактирование клиента');
  }

  async expectValues(name: string, notes: string, weight: string): Promise<void> {
    await expect(this.findBySelector('nameInput')).toHaveValue(name);
    await expect(this.findBySelector('notesInput')).toHaveValue(notes);
    await expect(this.findBySelector('weightInput')).toHaveValue(weight);
  }

  async expectError(): Promise<void> {
    await expect(this.findBySelector('error')).toBeVisible();
    await expect(this.findBySelector('error')).toHaveText(/\S/);
    await expect(this.findBySelector('submitButton')).toBeEnabled();
  }

  async cancel(): Promise<void> {
    await this.findBySelector('cancelButton').click();
    await this.waitForHidden();
  }

  async submit(): Promise<void> {
    await this.findBySelector('submitButton').click();
  }

  async fillFields(options: FillAndSubmitOptions): Promise<void> {
    await this.waitForVisible();
    await this.findBySelector('nameInput').fill(options.name);

    if (options.notes !== undefined) {
      await this.findBySelector('notesInput').fill(options.notes);
    }

    if (options.weight !== undefined) {
      await this.findBySelector('weightInput').fill(String(options.weight));
    }
  }

  async fillAndSubmit(options: FillAndSubmitOptions): Promise<void> {
    await this.fillFields(options);
    await this.submit();
  }
}
