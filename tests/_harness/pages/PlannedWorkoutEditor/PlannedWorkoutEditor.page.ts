import type { Page as PlaywrightPage } from 'playwright';

import { PlannedWorkoutEditorBlock } from '../../blocks/PlannedWorkoutEditor/PlannedWorkoutEditor.block';
import { Page } from '../../classes/Page';

export class PlannedWorkoutEditorPage extends Page {
  readonly title = 'План тренировки';
  readonly url = '/clients';
  readonly selectors = {
    root: '.PlannedWorkoutEditor',
    title: '.PlannedWorkoutEditor-Title'
  } as const;

  constructor(page: PlaywrightPage) {
    super(page);
  }

  async openNew(clientId: string): Promise<void> {
    await super.open(`/${clientId}/plans/new`);
    await new PlannedWorkoutEditorBlock(this.page).waitForReady();
  }

  async clickBack(): Promise<void> {
    await this.page.locator('.PlannedWorkoutEditor-Back').click();
  }

  async openExisting(clientId: string, planId: string): Promise<void> {
    await super.open(`/${clientId}/plans/${planId}`);
    await new PlannedWorkoutEditorBlock(this.page).waitForReady();
  }
}
