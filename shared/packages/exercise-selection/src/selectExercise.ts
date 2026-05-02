// import { isNumber, sum, sample, fromKeys } from '@step-wise/utils'
// import { normalPDF } from '@step-wise/math-tools'
// import { type SkillTree, ensureSkillId, type SkillId } from '@step-wise/skill-definition'
// import { type SkillLevelSet } from '@step-wise/skill-tracking'
// import { type ExerciseMetaData } from '@step-wise/exercise-definition'

// import { exercises, getExerciseName, fixExerciseId } from '../../skills'

// import { mu, sigma, thresholdFactor } from './settings'
// import { getExerciseSuccessRates } from './successRates'

// export type PreviousExercise = {
// 	exerciseId: string
// 	createdAt: number
// 	updatedAt: number
// }

// function getExerciseMetaData(exerciseId: string): ExerciseMetaData {
// 	return require(`../../../eduContent/${exercises[exerciseId].path.join('/')}/${getExerciseName(exerciseId)}`).metaData as ExerciseMetaData
// }

// // Select an exercise intelligently based on available skill data.
// export async function selectExercise(skillTree: SkillTree, skillId: SkillId, getSkillLevelSet: (skillIds: SkillId[]) => Promise<SkillLevelSet>, previousExercises: PreviousExercise[] = []): Promise<string> {
// 	// Load the skill and ensure it has exercises.
// 	const skill = skillTree[ensureSkillId(skillTree, skillId)]
// 	let exerciseIds = skill.exercises
// 	if (exerciseIds.length === 0) throw new Error(`Invalid request: cannot get an exercise for skill "${skill.id}". This skill has no exercises yet.`)

// 	// Load the meta data for the exercises.
// 	const exerciseMetaDatas = fromKeys(exerciseIds, getExerciseMetaData) as Record<string, ExerciseMetaData>

// 	// Filter out exercises that have been done too recently.
// 	const sortedPreviousExercises = [...previousExercises].sort((a, b) => b.createdAt - a.createdAt)
// 	const filteredExerciseIds = exerciseIds.filter(exerciseId => {
// 		const metaData = exerciseMetaDatas[exerciseId]
// 		const repeatAfter = isNumber(metaData.repeatAfter) ? metaData.repeatAfter : 1
// 		const exercisesSince = sortedPreviousExercises.findIndex(exercise => fixExerciseId(exercise.exerciseId, skill.id) === exerciseId)
// 		return exercisesSince === -1 || exercisesSince >= repeatAfter
// 	})
// 	if (filteredExerciseIds.length > 0) exerciseIds = filteredExerciseIds

// 	// Calculate selection rates and select based on them.
// 	const exerciseMetaDatasArray = exerciseIds.map(exerciseId => exerciseMetaDatas[exerciseId])
// 	const successRates = await getExerciseSuccessRates(exerciseMetaDatasArray, getSkillLevelSet)
// 	const weights = exerciseIds.map(exerciseId => isNumber(exerciseMetaDatas[exerciseId].weight) ? Math.abs(exerciseMetaDatas[exerciseId].weight) : 1)
// 	const selectionRates = getSelectionRates(successRates, weights)
// 	return sample(exerciseIds, selectionRates)
// }

// // Get selection probabilities from exercise success rates.
// export function getSelectionRates(successRates: number[], weights = successRates.map(() => 1)): number[] {
// 	// Find selection scores.
// 	let selectionScores = successRates.map(successRate => normalPDF(successRate, mu, sigma))

// 	// Filter out exercises that don't make the threshold.
// 	const threshold = Math.max(...selectionScores) * thresholdFactor
// 	selectionScores = selectionScores.map(rate => rate < threshold ? 0 : rate)

// 	// Apply the exercise weights.
// 	selectionScores = selectionScores.map((rate, index) => rate * weights[index])

// 	// Normalize the given scores.
// 	const selectionScoresSum = sum(selectionScores)
// 	return selectionScores.map(rate => rate / selectionScoresSum)
// }

// // Select a random exercise without taking skill data into account.
// export function selectRandomExercise(skillTree: SkillTree, skillId: SkillId): string {
// 	return selectExerciseFromList(skillTree[ensureSkillId(skillTree, skillId)].exercises)
// }

// // Select a random example.
// export function selectRandomExample(skillTree: SkillTree, skillId: SkillId): string {
// 	return selectExerciseFromList(skillTree[ensureSkillId(skillTree, skillId)].examples)
// }

// // Select an exercise from a list, taking exercise weights into account.
// export function selectExerciseFromList(exerciseIds: string[]): string {
// 	if (!Array.isArray(exerciseIds) || exerciseIds.length === 0) throw new Error(`Invalid request: cannot pick an exercise. No valid list of exercise IDs was provided.`)
// 	const exerciseMetaDatas = exerciseIds.map(getExerciseMetaData)
// 	const weights = exerciseMetaDatas.map(exerciseMetaData => isNumber(exerciseMetaData.weight) ? Math.abs(exerciseMetaData.weight) : 1)
// 	return sample(exerciseIds, weights)
// }
