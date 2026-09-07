import { ensureArray, ensureNumberArray, ensureString, hasDuplicates, sum } from '@step-wise/js-utils'
import { ensureSetup } from '@step-wise/skill-setup'

import type { CourseSpecification } from './types.ts'

export function ensureCourseSpecification(specification: CourseSpecification): CourseSpecification {
	// Check the required arrays.
	const startingPointIds = ensureArray(specification.startingPointIds).map(skillId => ensureString(skillId))
	const learningGoalIds = ensureArray(specification.learningGoalIds).map(skillId => ensureString(skillId))

	// Ensure there are no duplicate endpoints.
	if (hasDuplicates(startingPointIds)) throw new Error(`Invalid course starting points: there are duplicate skills in the list.`)
	if (hasDuplicates(learningGoalIds)) throw new Error(`Invalid course learning goals: there are duplicate skills in the list.`)

	// Validate the goal weights.
	let learningGoalWeights = specification.learningGoalWeights
	if (learningGoalWeights) {
		learningGoalWeights = ensureNumberArray(learningGoalWeights, { nonNegative: true })
		if (learningGoalWeights.length !== learningGoalIds.length) throw new Error(`Invalid course goal weights: expected ${learningGoalIds.length} weights but received ${learningGoalWeights.length}.`)
		if (sum(learningGoalWeights) === 0) throw new Error(`Invalid course goal weights: the weights must have a positive sum.`)
	}

	// Validate the block goals.
	let blockLearningGoalIds = specification.blockLearningGoalIds
	if (blockLearningGoalIds) blockLearningGoalIds = ensureArray(blockLearningGoalIds).map(skillIds => ensureArray(skillIds).map(skillId => ensureString(skillId)))

	// Validate the setup.
	const setup = specification.setup === undefined ? undefined : ensureSetup(specification.setup)

	// Return the normalized data.
	return {
		learningGoalIds,
		startingPointIds,
		blockLearningGoalIds,
		learningGoalWeights,
		setup,
	}
}
