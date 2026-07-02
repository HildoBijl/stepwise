import { type SkillSetup, type SkillSetupLike, ensureSetup, and } from '@step-wise/skill-setup'

import type { StepExerciseSteps } from './types'

export function stepsToSetup(steps: StepExerciseSteps): { steps: StepExerciseSteps, setup?: SkillSetup } {
	const setup = getSetupFromSteps(steps)
	return {
		steps,
		...(setup === undefined ? {} : { setup }),
	}
}

function getSetupFromSteps(steps: StepExerciseSteps): SkillSetup | undefined {
	if (!Array.isArray(steps)) throw new Error(`Invalid getSetupFromSteps call: expected a steps array, but received "${steps}".`)
	steps = steps.flat().filter(step => !!step)
	if (steps.length === 0) return undefined
	return and(...steps.map(step => ensureSetup(step as SkillSetupLike)))
}
