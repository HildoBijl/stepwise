export const temp = 3

// import type { SkillId, SkillTree } from '@step-wise/skill-definition'
// import type { SkillLevelSet } from '@step-wise/skill-tracking'

// import { exercises, getExerciseName } from '../../skills'

// import { selectExercise, selectRandomExercise, selectRandomExample } from './selectExercise'

// export type PreviousExercise = {
// 	exerciseId: string
// 	createdAt: number
// 	updatedAt: number
// }

// export type ExerciseInstance<TState = Record<string, unknown>> = {
// 	exerciseId: string
// 	state: TState
// }

// // Get a new exercise based on skill data.
// export async function getNewExercise<TState = Record<string, unknown>>(skillTree: SkillTree, skillId: SkillId | string, getSkillLevelSet: (skillIds: SkillId[]) => Promise<SkillLevelSet>, previousExercises: PreviousExercise[] = []): Promise<ExerciseInstance<TState>> {
// 	const jointExerciseId = await selectExercise(skillTree, skillId, getSkillLevelSet, previousExercises)
// 	return getExercise<TState>(jointExerciseId)
// }

// // Get a random exercise (ignores skill data).
// export function getNewRandomExercise<TState = Record<string, unknown>>(skillTree: SkillTree, skillId: SkillId): ExerciseInstance<TState> {
// 	const exerciseId = selectRandomExercise(skillTree, skillId)
// 	return getExercise<TState>(exerciseId)
// }

// // Get a random example.
// export function getNewRandomExample<TState = Record<string, unknown>>(skillTree: SkillTree, skillId: SkillId): ExerciseInstance<TState> {
// 	const exerciseId = selectRandomExample(skillTree, skillId)
// 	return getExercise<TState>(exerciseId, true)
// }

// // Build an exercise instance from an exerciseId.
// export function getExercise<TState = Record<string, unknown>>(exerciseId: string, example?: boolean): ExerciseInstance<TState> {
// 	const { generateState } = require(`../../../eduContent/${exercises[exerciseId].path.join('/')}/${getExerciseName(exerciseId)}`) as { generateState: (example?: boolean) => TState }
// 	return {
// 		exerciseId,
// 		state: generateState(example),
// 	}
// }
