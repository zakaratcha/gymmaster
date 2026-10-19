import { expect } from '@playwright/test';
import type { Page as PlaywrightPage } from 'playwright';

import { Block } from '../../classes/Block';

export class WorkoutSessionBlock extends Block {
  readonly selectors = {
    root: '.WorkoutSession',
    form: '.WorkoutSession-Form',
    errorBlock: '.WorkoutSession-ErrorBlock',
    error: '.WorkoutSession-Error',
    status: '.WorkoutSession-Status',
    success: '.WorkoutSession-Success',
    exerciseCard: '.WorkoutSession-ExerciseCard',
    exerciseTitle: '.WorkoutSession-ExerciseHeader strong',
    exerciseSelect: '.WorkoutSession-ExerciseSelect',
    addExercise: '.WorkoutSession-AddExercise button',
    setRow: '.WorkoutSession-SetRow',
    setValue: '.WorkoutSession-SetValue',
    save: '.WorkoutSession-Save',
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

  async addExercise(exerciseName: string): Promise<void> {
    const before = await this.exerciseCount();
    await this.findBySelector('exerciseSelect').selectOption({ label: exerciseName });
    await this.findBySelector('addExercise').click();
    await expect(this.findBySelector('exerciseCard')).toHaveCount(before + 1);
  }

  async removeExercise(exercisePosition: number): Promise<void> {
    const before = await this.exerciseCount();
    const card = this.findBySelector('exerciseCard').nth(exercisePosition);
    const names = await this.exerciseNames();
    const exerciseName = names[exercisePosition];
    if (exerciseName === undefined) {
      throw new Error(`Нет упражнения в позиции ${exercisePosition + 1}`);
    }

    await card.getByRole('button', { name: `Удалить упражнение ${exerciseName}`, exact: true }).click();
    await expect(this.findBySelector('exerciseCard')).toHaveCount(before - 1);
  }

  async moveExercise(exercisePosition: number, direction: 'up' | 'down'): Promise<void> {
    const card = this.findBySelector('exerciseCard').nth(exercisePosition);
    const names = await this.exerciseNames();
    const exerciseName = names[exercisePosition];
    if (exerciseName === undefined) {
      throw new Error(`Нет упражнения в позиции ${exercisePosition + 1}`);
    }

    const directionLabel = direction === 'up' ? 'вверх' : 'вниз';
    await card
      .getByRole('button', { name: `Переместить упражнение ${exerciseName} ${directionLabel}`, exact: true })
      .click();
  }

  async exerciseNames(): Promise<string[]> {
    const titles = this.findBySelector('exerciseTitle');
    const contents = await titles.allTextContents();
    return contents.map(title => title.replace(/^\d+\.\s*/, '').trim());
  }

  private async exerciseCount(): Promise<number> {
    return await this.findBySelector('exerciseCard').count();
  }

  async expectExerciseOrder(names: readonly string[]): Promise<void> {
    await expect(this.findBySelector('exerciseCard')).toHaveCount(names.length);
    await expect.poll(() => this.exerciseNames()).toEqual([...names]);
  }

  async failNextSave(status: number): Promise<void> {
    await this.page.route(/\/api\/clients\/[^/]+\/workout-sessions\/[^/]+$/, async route => {
      if (route.request().method() !== 'PATCH') {
        await route.continue();
        return;
      }

      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Временная ошибка сервера' })
      });
    });
  }

  async saveFacts(status: number): Promise<void> {
    const response = this.page.waitForResponse(response => {
      const url = new URL(response.url());
      return (
        response.request().method() === 'PATCH' && /\/api\/clients\/[^/]+\/workout-sessions\/[^/]+$/.test(url.pathname)
      );
    });

    const [saved] = await Promise.all([response, this.findBySelector('save').click()]);
    expect(saved.status()).toBe(status);
  }

  async saveFactsWithoutRequest(): Promise<void> {
    await this.findBySelector('save').click();
  }

  async expectSaveSuccess(): Promise<void> {
    await expect(this.findBySelector('success')).toBeVisible();
    await expect(this.findBySelector('success')).toHaveText(/\S/);
  }

  async expectFormError(): Promise<void> {
    await expect(this.findBySelector('error')).toBeVisible();
    await expect(this.findBySelector('error')).toHaveText(/\S/);
    await expect(this.findBySelector('save')).toBeEnabled();
  }

  async expectSetInputs(exercisePosition: number, setPosition: number, reps: string, weightKg: string): Promise<void> {
    const inputs = this.findBySelector('exerciseCard')
      .nth(exercisePosition)
      .locator('.WorkoutSession-SetRow')
      .nth(setPosition)
      .locator('input[type="number"]');
    await expect(inputs.nth(0)).toHaveValue(reps);
    await expect(inputs.nth(1)).toHaveValue(weightKg);
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
    await expect(this.page).not.toHaveURL(/\/workouts\/[^/]+\/[^/]+$/);
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
