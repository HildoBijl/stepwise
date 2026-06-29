import { type SkillSetup, type SkillSetupLike, ensureSetup, and } from '@step-wise/skill-setup'

import type { StepExerciseSteps } from './types'

export function stepsToSetup(steps: StepExerciseSteps): { steps: StepExerciseSteps, setup: SkillSetup } {
	return {
		steps,
		setup: getSetupFromSteps(steps),
	}
}

function getSetupFromSteps(steps: StepExerciseSteps): SkillSetup {
	if (!Array.isArray(steps)) throw new Error(`Invalid getSetupFromSteps call: expected a steps array, but received "${steps}".`)
	return and(...steps.flat().filter(step => !!step).map(step => ensureSetup(step as SkillSetupLike)))
}
