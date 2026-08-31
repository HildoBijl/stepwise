/* isPracticeNeeded checks whether a given skill still requires practice. Possible outcomes are:
 * undefined: no data is given yet.
 * 0: skill is mastered.
 * 1: work is useful but not directly necessary. (No recommendation.)
 * 2: work is necessary. (Recommend.)
 */
export function isPracticeNeeded(skillLevelSet, skillId, priorKnowledge = false, skillThresholds) {
	// If there is no skill data, return undefined.
	if (!skillLevelSet.hasRequiredDataFor(skillId))
		return undefined

	// Determine the thresholds to apply.
	const mastery = priorKnowledge ? skillThresholds.priorKnowledgeMastery : skillThresholds.mastery
	const recap = priorKnowledge ? skillThresholds.priorKnowledgeRecap : skillThresholds.recap

	// Check if the thresholds are satisfied.
	const EV = skillLevelSet.getExpectedSuccessRate(skillId)
	if (EV > mastery)
		return 0 // Sufficient mastery!
	if (EV < recap)
		return 2 // Not there yet.
	if (priorKnowledge)
		return 1 // It's prior knowledge: we can work but don't really have to.
	if (skillLevelSet.getHighestExpectedSuccessRate(skillId) > mastery)
		return 1 // There has been mastery in the past, so it's not completely necessary.
	return 2 // There has never been mastery yet: keep on working!
}
