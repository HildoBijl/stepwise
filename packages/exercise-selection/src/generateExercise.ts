import type { SkillId } from '@step-wise/skill-definition'
import type { SkillLevelSet } from '@step-wise/skill-tracking'
import { type Exercise, type ExerciseMode } from '@step-wise/exercise-definition'
import { type ExerciseId, type ExerciseCollection } from '@step-wise/exercise-bundling'

import { PreviousExercise, ExerciseInstance } from './types'
import { selectExercise, selectRandomExercise } from './selectExercise'

// Get a new exercise based on skill data.
export async function generateSkillBasedExerciseInstance(exercises: ExerciseCollection, getSkillLevelSet: (skillIds: SkillId[]) => Promise<SkillLevelSet>, previousExercises: PreviousExercise[] = []): Promise<ExerciseInstance> {
	const exerciseId = await selectExercise(exercises, getSkillLevelSet, previousExercises)
	return generateExerciseInstance(exerciseId, exercises[exerciseId], 'solo', false)
}

// Get a random exercise (ignores skill data).
export function generateRandomExerciseInstance(exercises: ExerciseCollection, mode: ExerciseMode, example?: boolean): ExerciseInstance {
	const exerciseId = selectRandomExercise(exercises)
	return generateExerciseInstance(exerciseId, exercises[exerciseId], mode, example)
}

// Build an exercise instance from an exerciseId.
function generateExerciseInstance(exerciseId: ExerciseId, exercise: Exercise, mode: ExerciseMode, example = false): ExerciseInstance {
	const { generateParameters, getInitialState } = exercise
	const parameters = generateParameters(example)
	return {
		exerciseId,
		mode,
		parameters,
		initialState: getInitialState(parameters),
		history: [],
	}
}
