import { expect } from '@playwright/test';
import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

export class PlannedWorkoutEditorBlock extends Block {
  readonly selectors = {
    root: '.PlannedWorkoutEditor',
    form: '.PlannedWorkoutEditor-Form',
    date: '#planned-date',
    tag: '#split-tag',
    exerciseSelect: '.PlannedWorkoutEditor-ExerciseSelect',
    addExercise: '.PlannedWorkoutEditor-AddExercise button',
    save: '.PlannedWorkoutEditor-Save',
    error: '.PlannedWorkoutEditor-FormError',
    exerciseCard: '.PlannedWorkoutEditor-ExerciseCard',
    setRow: '.PlannedWorkoutEditor-SetRow'
  } as const;

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async waitForReady(): Promise<void> {
    await this.waitForVisible();
    await this.findBySelector('form').waitFor({ state: 'visible' });
  }

  async fillPlanFields(plannedDate: string, splitTag: string): Promise<void> {
    await this.findBySelector('date').fill(plannedDate);
    await this.findBySelector('tag').fill(splitTag);
  }

  async addExercise(name: string): Promise<void> {
    await this.findBySelector('exerciseSelect').selectOption({ label: name });
    await this.findBySelector('addExercise').click();
  }

  async fillSet(exercisePosition: number, setPosition: number, reps: string, weightKg: string): Promise<void> {
    const card = this.findBySelector('exerciseCard').nth(exercisePosition);
    await card.locator('[data-field="reps"]').nth(setPosition).fill(reps);
    await card.locator('[data-field="weightKg"]').nth(setPosition).fill(weightKg);
  }

  async moveExerciseDown(exerciseName: string): Promise<void> {
    await this.page.getByRole('button', { name: `Переместить ${exerciseName} ниже`, exact: true }).click();
  }

  async clickSave(): Promise<void> {
    await this.findBySelector('save').click();
  }

  async saveAndWaitForResponse(): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      response =>
        response.url().includes('/api/clients/') &&
        response.url().includes('/plans') &&
        ['POST', 'PATCH'].includes(response.request().method())
    );
    await this.findBySelector('save').click();
    const response = await responsePromise;
    expect(response.ok()).toBe(true);
  }

  async expectExerciseCount(count: number): Promise<void> {
    await expect(this.findBySelector('exerciseCard')).toHaveCount(count);
  }

  async expectExerciseNames(names: readonly string[]): Promise<void> {
    const texts = await this.findBySelector('exerciseCard').locator('strong').allTextContents();
    expect(texts.map(text => text.replace(/^\d+\.\s*/, ''))).toEqual(names);
  }

  async expectError(): Promise<void> {
    await expect(this.findBySelector('error')).toBeVisible();
  }
}
