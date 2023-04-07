import { useParams } from 'react-router-dom'

import { processOptions } from 'step-wise/util/objects'
import { getEV } from 'step-wise/skillTracking'
import { ensureSkillId } from 'step-wise/edu/skills'

const defaultSkillThresholds = {
	pass: 0.55, // If the skill level is above this level, the skill is considered mastered.
	recapFactor: 0.90, // [Multiplied by pass.] If the skill level is below this factor times the pass rate (above), then it is considered "forgotten" and needs to be readressed.
	pkFactor: 1, // [Multiplied by pass.] If a prior knowledge skill is above this level, it is considered mastered.
	pkRecapFactor: 0.8, // [Multiplied by pass * pkFactor.] If the skill level for a prior skill drops below this factor times the pass rate times the pkFactor, then it is considered "forgotten".
}
export { defaultSkillThresholds }

/* isPracticeNeeded checks whether a given skill still requires practice. Possible outcomes are:
 * undefined: no data is given yet.
 * 0: skill is mastered.
 * 1: work is useful but not directly necessary. (No recommendation.)
 * 2: work is necessary. (Recommend.)
 */
export function isPracticeNeeded(skillData, priorKnowledge = false, skillThresholds = {}) {
	// If there is no skillData, return undefined.
	if (!skillData)
		return undefined

	// Determine the thresholds to apply.
	skillThresholds = processOptions(skillThresholds, defaultSkillThresholds)
	const pass = skillThresholds.pass * (priorKnowledge ? skillThresholds.pkFactor : 1)
	const recap = pass * (priorKnowledge ? skillThresholds.pkRecapFactor : skillThresholds.recapFactor)

	// Check if the thresholds are satisfied.
	const EV = getEV(skillData.coefficients)
	if (EV > pass)
		return 0 // Sufficient mastery!
	if (EV < recap)
		return 2 // Not there yet.
	if (priorKnowledge)
		return 1 // It's prior knowledge: we can work but don't really have to.
	if (getEV(skillData.highest) > pass)
		return 1 // There has been mastery in the past, so it's not completely necessary.
	return 2 // There has never been mastery yet: keep on working!
}

// useSkillId returns the skill ID extracted from the URL. If this skill ID does not exist, it throws an error.
export function useSkillId() {
	const { skillId } = useParams()
	return skillId && ensureSkillId(skillId) // Allow skillId to be undefined.
}
