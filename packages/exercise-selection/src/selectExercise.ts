import { isNumber, sum, sample, filterProperties } from '@step-wise/js-utils'
import { normalPDF } from '@step-wise/math-tools'
import type { SkillId } from '@step-wise/skill-definition'
import type { SkillLevelSet } from '@step-wise/skill-tracking'
import type { ExerciseMode } from '@step-wise/exercise-definition'
import { type ExerciseId, type ExerciseCollection, filterExerciseCollectionByMode } from '@step-wise/exercise-bundling'

import { PreviousExercise } from './types'
import { mu, sigma, thresholdFactor } from './settings'
import { getExerciseSuccessRates } from './successRates'

// Select an exercise intelligently based on available skill data.
export async function selectExercise(exercises: ExerciseCollection, getSkillLevelSet: (skillIds: SkillId[]) => Promise<SkillLevelSet>, previousExercises: PreviousExercise[] = []): Promise<ExerciseId> {
	// Skill-based selection is only meaningful for an individual learner.
	const soloExercises = getExercisesForMode(exercises, 'solo')

	// Filter out exercises that have been done too recently.
	const sortedPreviousExercises = [...previousExercises].sort((a, b) => b.createdAt - a.createdAt)
	let suitableExercises: ExerciseCollection = filterProperties(soloExercises, (exercise, exerciseId) => {
		const { metadata } = exercise
		const repeatAfter = isNumber(metadata.repeatAfter) ? metadata.repeatAfter : 1
		const exercisesSince = sortedPreviousExercises.findIndex(previousExercise => previousExercise.exerciseId === exerciseId)
		return exercisesSince === -1 || exercisesSince >= repeatAfter
	}) as ExerciseCollection
	if (Object.values(suitableExercises).length === 0) suitableExercises = soloExercises

	// Calculate selection rates and select based on them.
	const successRates = await getExerciseSuccessRates(Object.values(suitableExercises).map(exercise => exercise.metadata), getSkillLevelSet)
	const weights = Object.values(suitableExercises).map(exercise => isNumber(exercise.metadata.weight) ? Math.abs(exercise.metadata.weight) : 1)
	const selectionRates = getSelectionRates(successRates, weights)
	return sample(Object.keys(suitableExercises), { weights: selectionRates })
}

// Get selection probabilities from exercise success rates.
export function getSelectionRates(successRates: number[], weights = successRates.map(() => 1)): number[] {
	// Find selection scores.
	let selectionScores = successRates.map(successRate => normalPDF(successRate, mu, sigma))

	// Filter out exercises that don't make the threshold.
	const threshold = Math.max(...selectionScores) * thresholdFactor
	selectionScores = selectionScores.map(rate => rate < threshold ? 0 : rate)

	// Apply the exercise weights.
	selectionScores = selectionScores.map((rate, index) => rate * weights[index])

	// Normalize the given scores.
	const selectionScoresSum = sum(selectionScores)
	return selectionScores.map(rate => rate / selectionScoresSum)
}

// Select a random exercise without taking skill data into account.
export function selectRandomExercise(exercises: ExerciseCollection, mode: ExerciseMode): ExerciseId {
	const exercisesForMode = getExercisesForMode(exercises, mode)
	const weights = Object.values(exercisesForMode).map(exercise => isNumber(exercise.metadata.weight) ? Math.abs(exercise.metadata.weight) : 1)
	return sample(Object.keys(exercisesForMode), { weights })
}

function getExercisesForMode(exercises: ExerciseCollection, mode: ExerciseMode): ExerciseCollection {
	if (exercises === undefined) throw new Error('Invalid request: cannot pick an exercise. No valid set of exercises was provided.')
	const exercisesForMode = filterExerciseCollectionByMode(exercises, mode)
	if (Object.values(exercisesForMode).length === 0) throw new Error(`Invalid request: cannot pick an exercise. No exercises support the requested mode "${mode}".`)
	return exercisesForMode
}
