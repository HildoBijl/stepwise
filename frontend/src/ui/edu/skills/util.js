import { processOptions } from 'step-wise/util/objects'
import { getEV } from 'step-wise/skillTracking'

import { isSkillMastered } from '../courses/util'

const defaultSkillThresholds = {
	pass: 0.68, // If the skill is above this level, we can move on.
	recap: 0.58, // If the skills is below this level, we must recap: go back to it.
	pkPass: 0.68, // If a prior knowledge has this skill level, we can move on.
	pkRecap: 0.48, // If the skill level for a prior skil drops below this, we must recap.
}
export { defaultSkillThresholds }

// isPracticeNeeded checks whether a given skill still requires practice. It returns a number: 0 (enough mastery), 1 (can work) or 2 (should work).
export function isPracticeNeeded(skillData, priorKnowledge = false, skillThresholds = {}) {
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

// getSkillRecommendation receives a list of skill IDs and finds the first skill with work to do. Returns undefined if all skills are done. If a skill has no skillData, it also counts as "has work to do". An optional set of lists of mastered skills can be given which will definitely be marked as mastered.
export function getSkillRecommendation(skillsData, pkSkillIds, skillIds, masteredSkills = { priorKnowledge: [], course: [] }, skillThresholds) {
	// Check if there is a prior knowledge that absolutely requires work.
	const pkRecommendation = pkSkillIds.find(skillId => !isSkillMastered(skillId, masteredSkills) && (!skillsData[skillId] || isPracticeNeeded(skillsData[skillId], true, skillThresholds) >= 2))
	if (pkRecommendation)
		return pkRecommendation

	// Check the regular skills to see if there is something that could use work.
	return skillIds.find(skillId => !isSkillMastered(skillId, masteredSkills) && (!skillsData[skillId] || isPracticeNeeded(skillsData[skillId], false, skillThresholds) >= 1))
}