import { listExercisesAsAdmin } from './listExercises';
import { updateExercise } from './updateExercise';

export async function deleteAllExercises(): Promise<void> {
  const response = await listExercisesAsAdmin();
  for (const exercise of response.exercises) {
    await updateExercise(exercise.id, { archived: true });
  }
}
