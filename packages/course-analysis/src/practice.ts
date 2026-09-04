import type { SkillId, SkillThresholdOptions, SkillTree } from '@step-wise/skill-definition'
import type { SkillLevelSet } from '@step-wise/skill-tracking'

import type { PracticeNeeded, PracticeNeededMap } from './types.ts'

export function isPracticeNeeded(skillLevelSet: SkillLevelSet, skillId: SkillId, priorKnowledge = false, skillThresholds: SkillThresholdOptions): PracticeNeeded | undefined {
	if (!skillLevelSet.hasRequiredDataFor(skillId)) return undefined

	const mastery = priorKnowledge ? skillThresholds.priorKnowledgeMastery : skillThresholds.mastery
	const recap = priorKnowledge ? skillThresholds.priorKnowledgeRecap : skillThresholds.recap
	const expectedSuccessRate = skillLevelSet.getExpectedSuccessRate(skillId)
	if (expectedSuccessRate > mastery) return 0
	if (expectedSuccessRate < recap) return 2
	if (priorKnowledge) return 1
	if (skillLevelSet.getHighestExpectedSuccessRate(skillId) > mastery) return 1
	return 2
}

export function getPracticeNeeded(skillTree: SkillTree, course: { learningGoalIds: readonly SkillId[], priorKnowledgeIds: readonly SkillId[] }, skillLevelSet: SkillLevelSet): PracticeNeededMap {
	const result: PracticeNeededMap = {}
	course.learningGoalIds.forEach(goalId => checkPracticeNeeded(skillTree, goalId, skillLevelSet, course.priorKnowledgeIds, result))
	return result
}

function checkPracticeNeeded(skillTree: SkillTree, skillId: SkillId, skillLevelSet: SkillLevelSet, priorKnowledge: readonly SkillId[], result: PracticeNeededMap, bestParent?: PracticeNeeded): void {
	const skill = skillTree[skillId]
	if (!skill) throw new Error(`Invalid skill: could not find "${skillId}" when processing course data.`)

	const isPriorKnowledge = priorKnowledge.includes(skillId)
	let practiceNeeded = isPracticeNeeded(skillLevelSet, skillId, isPriorKnowledge, skill.thresholds)
	if (bestParent !== undefined && practiceNeeded !== undefined) practiceNeeded = Math.min(bestParent, practiceNeeded) as PracticeNeeded

	if (result[skillId] !== undefined && practiceNeeded !== undefined && result[skillId] <= practiceNeeded) return
	result[skillId] = practiceNeeded
	if (!isPriorKnowledge)
		skill.prerequisiteIds.forEach(prerequisiteId => checkPracticeNeeded(skillTree, prerequisiteId, skillLevelSet, priorKnowledge, result, practiceNeeded))
}
