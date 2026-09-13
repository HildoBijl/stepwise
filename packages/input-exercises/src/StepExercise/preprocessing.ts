import { type SkillSetup, type SkillSetupLike, ensureSetup, and } from '@step-wise/skill-setup'

import type { StepExerciseSteps } from './types.ts'

// Create the metadata for a step exercise, including the steps and the combined setup of all steps.
export function createStepExerciseMetadata(steps: StepExerciseSteps): { steps: StepExerciseSteps, setup?: SkillSetup } {
	ensureStepExerciseSteps(steps)
	const setup = getSetupFromSteps(steps)
	return {
		steps,
		...(setup === undefined ? {} : { setup }),
	}
}

// Ensure that the steps are valid: an array of steps, where each step is either a SkillSetupLike or an array of SkillSetupLike with at least two substeps.
export function ensureStepExerciseSteps(steps: StepExerciseSteps): StepExerciseSteps {
	if (!Array.isArray(steps)) throw new Error(`Invalid steps: expected an array, but received "${steps}".`)
	steps.forEach((step, index) => {
		if (Array.isArray(step) && step.length < 2) throw new Error(`Invalid step ${index + 1}: a substep array must contain at least two substeps.`)
	})
	return steps
}

// Get the combined setup of all steps, or undefined if no steps are defined.
function getSetupFromSteps(steps: StepExerciseSteps): SkillSetup | undefined {
	const definedSteps = steps.flat().filter(step => step !== undefined)
	if (definedSteps.length === 0) return undefined
	return and(...definedSteps.map(ensureSetup))
}
