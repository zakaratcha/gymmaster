import { expect } from '@playwright/test';
import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';
import { ClientHubBlock } from '../ClientHub/ClientHub.block';

export class WorkoutSessionBlock extends Block {
  readonly selectors = {
    root: '.WorkoutSession',
    form: '.WorkoutSession-Form',
    errorBlock: '.WorkoutSession-ErrorBlock',
    status: '.WorkoutSession-Status',
    exerciseCard: '.WorkoutSession-ExerciseCard',
    setRow: '.WorkoutSession-SetRow',
    setValue: '.WorkoutSession-SetValue',
    complete: '.WorkoutSession-Complete'
  } as const;

  constructor(page: PlaywrightPage) {
    super(page, null);
  }

  async waitForReady(): Promise<void> {
    await this.waitForVisible();
    await this.page.locator('.WorkoutSession-Form, .WorkoutSession-ErrorBlock').first().waitFor({ state: 'visible' });
  }

  async fillSet(exercisePosition: number, setPosition: number, reps: string, weightKg: string): Promise<void> {
    const card = this.findBySelector('exerciseCard').nth(exercisePosition);
    const inputs = card.locator('.WorkoutSession-SetRow input[type="number"]');
    await inputs.nth(setPosition * 2).fill(reps);
    await inputs.nth(setPosition * 2 + 1).fill(weightKg);
  }

  async addSet(exercisePosition: number): Promise<void> {
    await this.page
      .getByRole('button', { name: `Добавить подход в упражнение ${exercisePosition + 1}`, exact: true })
      .click();
  }

  async removeSet(exercisePosition: number, setPosition: number): Promise<void> {
    await this.page
      .getByRole('button', {
        name: `Удалить подход ${setPosition + 1} у упражнения ${exercisePosition + 1}`,
        exact: true
      })
      .click();
  }

  async completeAndWaitForResult(): Promise<void> {
    const patchResponse = this.page.waitForResponse(response => {
      const url = new URL(response.url());
      return (
        response.request().method() === 'PATCH' && /\/api\/clients\/[^/]+\/workout-sessions\/[^/]+$/.test(url.pathname)
      );
    });
    const completeResponse = this.page.waitForResponse(response => {
      const url = new URL(response.url());
      return (
        response.request().method() === 'POST' &&
        /\/api\/clients\/[^/]+\/workout-sessions\/[^/]+\/complete$/.test(url.pathname)
      );
    });

    const [savedResponse, completedResponse] = await Promise.all([
      patchResponse,
      completeResponse,
      this.findBySelector('complete').click()
    ]);
    expect(savedResponse.status()).toBe(200);
    expect(completedResponse.status()).toBe(200);
    await expect(this.page).toHaveURL(/\/clients\/[^/]+$/);
    await new ClientHubBlock(this.page).waitForWorkoutDataReady();
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitForReady();
  }

  async expectCompleted(): Promise<void> {
    await this.waitForReady();
    await expect(this.findBySelector('status')).toHaveText('Завершена');
  }

  async expectCompletedSet(
    exercisePosition: number,
    setPosition: number,
    reps: number,
    weightKg: number
  ): Promise<void> {
    const values = this.findBySelector('exerciseCard')
      .nth(exercisePosition)
      .locator('.WorkoutSession-SetRow')
      .nth(setPosition)
      .locator('.WorkoutSession-SetValue');
    await expect(values.nth(0)).toHaveText(`${reps} повт.`);
    await expect(values.nth(1)).toHaveText(`${weightKg} кг`);
  }
}
