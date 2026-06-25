import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

type FillAndSubmitOptions = {
  readonly name: string;
  readonly notes?: string;
  readonly weight?: number;
};

export class ClientCreateFormBlock extends Block {
  readonly selectors = {
    root: '.ClientCreateForm',
    nameInput: '.ClientCreateForm [name="name"]',
    notesInput: '.ClientCreateForm [name="notes"]',
    weightInput: '.ClientCreateForm [name="bodyWeightKg"]',
    submitButton: '.ClientCreateForm-Submit'
  };

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async fillAndSubmit(options: FillAndSubmitOptions): Promise<void> {
    await this.waitForVisible();
    await this.findBySelector('nameInput').fill(options.name);

    if (options.notes !== undefined) {
      await this.findBySelector('notesInput').fill(options.notes);
    }

    if (options.weight !== undefined) {
      await this.findBySelector('weightInput').fill(String(options.weight));
    }

    await this.findBySelector('submitButton').click();
  }
}
