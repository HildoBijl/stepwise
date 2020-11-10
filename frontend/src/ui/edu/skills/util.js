import { processOptions } from 'step-wise/util/objects'
import { getEV } from 'step-wise/skillTracking'

const defaultSkillThresholds = {
	pass: 0.68, // If the skill is above this level, we can move on.
	recap: 0.58, // If the skills is below this level, we must recap: go back to it.
	pkPass: 0.68, // If a prior knowledge has this skill level, we can move on.
	pkRecap: 0.46, // If the skill level for a prior skil drops below this, we must recap.
}
export { defaultSkillThresholds }

/* isPracticeNeeded checks whether a given skill still requires practice. Possible outcomes are:
 * undefined: no data is given yet.
 * 0: skill is mastered.
 * 1: work is useful but not directly necessary. (No recommendation.)
 * 2: work is necessary. (Recommend.)
 */
export function isPracticeNeeded(skillData, priorKnowledge = false, skillThresholds = {}) {
	// If there is no skillData, return the worst.
	if (!skillData)
		return undefined

	// Determine the thresholds to apply.
	skillThresholds = processOptions(skillThresholds, defaultSkillThresholds)
	const pass = priorKnowledge ? skillThresholds.pkPass : skillThresholds.pass
	const recap = priorKnowledge ? skillThresholds.pkRecap : skillThresholds.recap

	// Check if the thresholds are satisfied. For prior knowledge, don't use prerequisites (only the skill's only coefficients).
	const EV = getEV(priorKnowledge ? skillData.smoothenedCoefficients : skillData.coefficients)
	if (EV > pass)
		return 0 // Sufficient mastery!
	if (EV < recap)
		return 2 // Not there yet.
	if (priorKnowledge)
		return 1 // It's prior knowledge: we can work but don't really have to.
	if (getEV(priorKnowledge ? skillData.rawHighest : skillData.highest) > pass)
		return 1 // There has been mastery in the past, so it's not completely necessary.
	return 2 // There has never been mastery yet: keep on working!
}