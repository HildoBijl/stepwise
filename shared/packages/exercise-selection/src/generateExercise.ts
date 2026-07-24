import type { SkillId } from '@step-wise/skill-definition'
import type { SkillLevelSet } from '@step-wise/skill-tracking'
import { type ExerciseId, type Exercise, type ExerciseContainer } from '@step-wise/exercise-definition'

import { PreviousExercise, ExerciseInstance } from './types'
import { selectExercise, selectRandomExercise } from './selectExercise'

// Get a new exercise based on skill data.
export async function generateSkillBasedExerciseInstance(exercises: ExerciseContainer, getSkillLevelSet: (skillIds: SkillId[]) => Promise<SkillLevelSet>, previousExercises: PreviousExercise[] = []): Promise<ExerciseInstance> {
	const exerciseId = await selectExercise(exercises, getSkillLevelSet, previousExercises)
	return generateExerciseInstance(exerciseId, exercises[exerciseId], false)
}

// Get a random exercise (ignores skill data).
export function generateRandomExerciseInstance(exercises: ExerciseContainer, example?: boolean): ExerciseInstance {
	const exerciseId = selectRandomExercise(exercises)
	return generateExerciseInstance(exerciseId, exercises[exerciseId], example)
}

// Build an exercise instance from an exerciseId.
function generateExerciseInstance(exerciseId: ExerciseId, exercise: Exercise, example = false): ExerciseInstance {
	const { generateState } = exercise
	return {
		exerciseId,
		state: generateState(example),
	}
}
