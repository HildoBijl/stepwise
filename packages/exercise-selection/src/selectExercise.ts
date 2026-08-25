import { ensureArray, ensureNumber, sum, sample, filterProperties } from '@step-wise/js-utils'
import { normalPDF } from '@step-wise/math-tools'
import type { SkillId } from '@step-wise/skill-definition'
import type { SkillLevelSet } from '@step-wise/skill-tracking'
import { type ExerciseMode, resolveExerciseMetadata } from '@step-wise/exercise-definition'
import { type ExerciseId, type ExerciseCollection, filterExerciseCollectionByMode, isExerciseCollection } from '@step-wise/exercise-bundling'

import type { PreviousExercise } from './types'
import { mu, sigma, thresholdFactor } from './settings'
import { getExerciseSuccessRates } from './successRates'

// Select an exercise intelligently based on available skill data.
export async function selectExercise(exercises: ExerciseCollection, getSkillLevelSet: (skillIds: SkillId[]) => Promise<SkillLevelSet>, previousExercises: PreviousExercise[] = []): Promise<ExerciseId> {
	// Skill-based selection is only meaningful for an individual learner.
	const soloExercises = getExercisesForMode(exercises, 'solo')

	// Filter out exercises that have been done too recently.
	const sortedPreviousExercises = [...previousExercises].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
	let suitableExercises: ExerciseCollection = filterProperties(soloExercises, (exercise, exerciseId) => {
		const { repeatAfter } = resolveExerciseMetadata(exercise.metadata)
		const exercisesSince = sortedPreviousExercises.findIndex(previousExercise => previousExercise.exerciseId === exerciseId)
		return exercisesSince === -1 || exercisesSince >= repeatAfter
	}) as ExerciseCollection

	// repeatAfter is a preference: if every exercise is blocked, allow compatible exercises to repeat rather than making selection impossible.
	if (Object.values(suitableExercises).length === 0) suitableExercises = soloExercises

	// Calculate selection rates and select based on them.
	const successRates = await getExerciseSuccessRates(Object.values(suitableExercises).map(exercise => exercise.metadata), getSkillLevelSet)
	const weights = Object.values(suitableExercises).map(exercise => resolveExerciseMetadata(exercise.metadata).weight)
	const selectionRates = getSelectionRates(successRates, weights)
	return sample(Object.keys(suitableExercises), { weights: selectionRates })
}

// Get selection probabilities from exercise success rates.
export function getSelectionRates(successRates: number[], weights?: number[]): number[] {
	const ensuredSuccessRates = ensureArray(successRates).map(successRate => {
		const ensuredSuccessRate = ensureNumber(successRate, { nonNegative: true })
		if (ensuredSuccessRate > 1) throw new RangeError(`Invalid success rate: expected a value at most 1 but received ${ensuredSuccessRate}.`)
		return ensuredSuccessRate
	})
	if (ensuredSuccessRates.length === 0) throw new RangeError('Invalid success rates: expected at least one success rate.')

	const ensuredWeights = ensureArray(weights ?? ensuredSuccessRates.map(() => 1)).map(weight => ensureNumber(weight, { nonNegative: true }))
	if (ensuredWeights.length !== ensuredSuccessRates.length) throw new RangeError(`Invalid selection weights: expected ${ensuredSuccessRates.length} weights but received ${ensuredWeights.length}.`)

	// Find selection scores.
	let selectionScores = ensuredSuccessRates.map(successRate => normalPDF(successRate, mu, sigma))

	// Filter out exercises that don't make the threshold.
	const threshold = Math.max(...selectionScores) * thresholdFactor
	selectionScores = selectionScores.map(rate => rate < threshold ? 0 : rate)

	// Apply the exercise weights.
	selectionScores = selectionScores.map((rate, index) => rate * ensuredWeights[index])

	// Normalize the given scores.
	const selectionScoresSum = sum(selectionScores)
	if (selectionScoresSum <= 0) throw new RangeError('Invalid selection weights: at least one eligible exercise must have a positive weight.')
	return selectionScores.map(rate => rate / selectionScoresSum)
}

// Select a random exercise without taking skill data into account.
export function selectRandomExercise(exercises: ExerciseCollection, mode: ExerciseMode): ExerciseId {
	const exercisesForMode = getExercisesForMode(exercises, mode)
	const weights = Object.values(exercisesForMode).map(exercise => resolveExerciseMetadata(exercise.metadata).weight)
	return sample(Object.keys(exercisesForMode), { weights })
}

function getExercisesForMode(exercises: ExerciseCollection, mode: ExerciseMode): ExerciseCollection {
	if (!isExerciseCollection(exercises)) throw new TypeError('Invalid request: cannot pick an exercise. No valid exercise collection was provided.')
	const exercisesForMode = filterExerciseCollectionByMode(exercises, mode)
	if (Object.values(exercisesForMode).length === 0) throw new Error(`Invalid request: cannot pick an exercise. No exercises support the requested mode "${mode}".`)
	return exercisesForMode
}
