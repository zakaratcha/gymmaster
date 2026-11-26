import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

export class AdminTrainersStatusDialogBlock extends Block {
  readonly selectors = {
    root: '.AdminTrainers-StatusDialog'
  };

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async confirm(): Promise<void> {
    await this.findBySelector('root').getByRole('button', { name: 'Заблокировать', exact: true }).click();
  }

  async cancel(): Promise<void> {
    await this.findBySelector('root').getByRole('button', { name: 'Отмена', exact: true }).click();
  }
}
