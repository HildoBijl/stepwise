import { ensureBoolean } from '@step-wise/js-utils'
import type { SkillId } from '@step-wise/skill-setup'
import type { SkillLevelSet } from '@step-wise/skill-tracking'
import { type AnyExercise, type ExerciseMode, resolveExerciseMetadata, resolveExerciseParameters, resolveInitialState } from '@step-wise/exercise-definition'
import { type ExerciseId, type ExerciseCollection } from '@step-wise/exercise-bundling'

import type { ExerciseInstance, PreviousExercise } from './types.ts'
import { selectRandomExercise, selectSkillBasedExercise } from './selectExercise.ts'

// Get a new exercise based on skill data.
export function generateSkillBasedExerciseInstance(exercises: ExerciseCollection, loadSkillLevelSet: (skillIds: SkillId[]) => Promise<SkillLevelSet>, previousExercises?: PreviousExercise[]): Promise<ExerciseInstance>
export function generateSkillBasedExerciseInstance<TContext>(exercises: ExerciseCollection, loadSkillLevelSet: (skillIds: SkillId[]) => Promise<SkillLevelSet>, previousExercises: PreviousExercise[], context: TContext): Promise<ExerciseInstance>
export async function generateSkillBasedExerciseInstance(exercises: ExerciseCollection, loadSkillLevelSet: (skillIds: SkillId[]) => Promise<SkillLevelSet>, previousExercises: PreviousExercise[] = [], context: unknown = undefined): Promise<ExerciseInstance> {
	const exerciseId = await selectSkillBasedExercise(exercises, loadSkillLevelSet, previousExercises)
	return createExerciseInstance(exerciseId, exercises[exerciseId], 'solo', false, context)
}

// Get a random exercise (ignores skill data).
export function generateRandomExerciseInstance(exercises: ExerciseCollection, mode: ExerciseMode, example?: boolean): Promise<ExerciseInstance>
export function generateRandomExerciseInstance<TContext>(exercises: ExerciseCollection, mode: ExerciseMode, example: boolean, context: TContext): Promise<ExerciseInstance>
export async function generateRandomExerciseInstance(exercises: ExerciseCollection, mode: ExerciseMode, example = false, context: unknown = undefined): Promise<ExerciseInstance> {
	const exerciseId = selectRandomExercise(exercises, mode)
	return createExerciseInstance(exerciseId, exercises[exerciseId], mode, ensureBoolean(example), context)
}

// Build an exercise instance from an exerciseId.
async function createExerciseInstance(exerciseId: ExerciseId, exercise: AnyExercise, mode: ExerciseMode, example: boolean, context: unknown): Promise<ExerciseInstance> {
	const { generateParameters, getInitialState } = exercise
	const parameters = await resolveExerciseParameters(generateParameters, { example, context })
	return {
		exerciseId,
		exerciseVersion: resolveExerciseMetadata(exercise.metadata).version,
		mode,
		parameters,
		initialState: await resolveInitialState(getInitialState, { parameters, context }),
		history: [],
	}
}
