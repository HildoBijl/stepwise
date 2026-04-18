import { fromKeys } from '@step-wise/utils'

import { type Coefficients, smoothWithOrder, merge, mergeElementwise } from '../coefficients'

import { type SkillLike } from './types'

// Get the distribution of a skill based only on its setup. Returns undefined when there is no setup.
function getSetupCoefficients(skill: SkillLike, getCoefficients: (skillId: string) => Coefficients): Coefficients | undefined {
	if (!skill.setup) return undefined
	const skillIds = skill.setup.getSkillList()
	const coefficientSet = fromKeys(skillIds, getCoefficients)
	return skill.setup.getDistribution(coefficientSet, skill.inferenceOrder)
}

// Get the distributions of a skill based only on linked skills, one coefficient array per link.
function getLinkCoefficients(skill: SkillLike, getCoefficients: (skillId: string) => Coefficients): Coefficients[] {
	return (skill.links ?? []).map(link => {
		const rawCoefficients = link.skills.map(getCoefficients)
		const smoothedCoefficients = rawCoefficients.map(coefficients => smoothWithOrder(coefficients, link.order))
		return mergeElementwise(...smoothedCoefficients)
	})
}

// Apply inference to a skill, based on the skill itself, its setup and linked skills.
export function applyInferenceForSkill(skill: SkillLike, getCoefficients: (skillId: string) => Coefficients): Coefficients {
	const ownCoefficients = getCoefficients(skill.id)
	const setupCoefficients = getSetupCoefficients(skill, getCoefficients)
	const linkCoefficients = getLinkCoefficients(skill, getCoefficients)
	return merge(...[ownCoefficients, ...(setupCoefficients ? [setupCoefficients] : []), ...linkCoefficients])
}
