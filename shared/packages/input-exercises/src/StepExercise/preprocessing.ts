import { type SkillSetup, type SkillSetupLike, ensureSetup, and } from '@step-wise/skill-setup'

import type { StepExerciseMetaData, StepExerciseSteps } from './types'

export function addSetupFromSteps<TMetaData extends StepExerciseMetaData>(metaData: TMetaData, overwrite = false): TMetaData {
	if ('setup' in metaData && !overwrite) return metaData
	return { ...metaData, setup: getSetupFromSteps(metaData.steps) }
}

function getSetupFromSteps(steps: StepExerciseSteps): SkillSetup {
	if (!Array.isArray(steps)) throw new Error(`Invalid getSetupFromSteps call: expected a steps array, but received "${steps}".`)
	return and(...steps.flat().filter(step => !!step).map(step => ensureSetup(step as SkillSetupLike)))
}
