import { type SkillSetup, type SkillSetupLike, ensureSetup, and } from '@step-wise/skill-setup'

import type { StepExerciseSteps } from './types'

export function createStepExerciseMetadata(steps: StepExerciseSteps): { steps: StepExerciseSteps, setup?: SkillSetup } {
	ensureStepExerciseSteps(steps)
	const setup = getSetupFromSteps(steps)
	return {
		steps,
		...(setup === undefined ? {} : { setup }),
	}
}

export function ensureStepExerciseSteps(steps: StepExerciseSteps): StepExerciseSteps {
	if (!Array.isArray(steps)) throw new Error(`Invalid steps: expected an array, but received "${steps}".`)
	steps.forEach((step, index) => {
		if (Array.isArray(step) && step.length < 2) throw new Error(`Invalid step ${index + 1}: a substep array must contain at least two substeps.`)
	})
	return steps
}

function getSetupFromSteps(steps: StepExerciseSteps): SkillSetup | undefined {
	steps = steps.flat().filter(step => !!step)
	if (steps.length === 0) return undefined
	return and(...steps.map(step => ensureSetup(step as SkillSetupLike)))
}
