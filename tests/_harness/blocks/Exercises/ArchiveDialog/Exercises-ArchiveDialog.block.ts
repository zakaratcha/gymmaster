import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../../classes/Block';

export class ExercisesArchiveDialogBlock extends Block {
  readonly selectors = {
    root: 'dialog.Exercises-ArchiveDialog',
    confirmButton: '.Exercises-ArchiveConfirm',
    cancelButton: '.Exercises-ArchiveCancel'
  };

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async confirm(): Promise<void> {
    await this.findBySelector('confirmButton').click();
    await this.waitForHidden();
  }
}
