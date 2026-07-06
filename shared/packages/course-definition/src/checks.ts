import { ensureArray, ensureNumberArray, ensureString, hasDuplicates } from '@step-wise/utils'
import { ensureSetup } from '@step-wise/skill-setup'

import type { CourseData } from './types'

export function ensureCourseData(data: CourseData): CourseData {
	// Check the required arrays.
	const startingPoints = ensureArray(data.startingPoints).map(goal => ensureString(goal))
	const learningGoals = ensureArray(data.learningGoals).map(goal => ensureString(goal))

	// Ensure there are no duplicate endpoints.
	if (hasDuplicates(startingPoints)) throw new Error(`Invalid course starting points: there are duplicate skills in the list.`)
	if (hasDuplicates(learningGoals)) throw new Error(`Invalid course learning goals: there are duplicate skills in the list.`)

	// Validate the goal weights.
	let goalWeights = data.goalWeights
	if (goalWeights) {
		goalWeights = ensureNumberArray(goalWeights, true)
		if (goalWeights.length !== learningGoals.length) throw new Error(`Invalid course goal weights: expected ${learningGoals.length} weights but received ${goalWeights.length}.`)
	}

	// Validate the block goals.
	let blockGoals = data.blockGoals
	if (blockGoals) blockGoals = ensureArray(blockGoals).map(goals => ensureArray(goals).map(goal => ensureString(goal)))

	// Validate the setup.
	const setup = data.setup && ensureSetup(data.setup)

	// Return the normalized data.
	return {
		learningGoals,
		startingPoints,
		blockGoals,
		goalWeights,
		setup,
	}
}
