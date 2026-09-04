import type { SkillId, SkillThresholdOptions, SkillTree } from '@step-wise/skill-definition'
import type { Course } from '@step-wise/course-definition'
import type { SkillLevelSet } from '@step-wise/skill-tracking'

export type PracticeNeeded = 0 | 1 | 2
export type PracticeNeededMap = Partial<Record<SkillId, PracticeNeeded>>

export type PracticeNeededOptions = {
	skillThresholds: SkillThresholdOptions
	priorKnowledge?: boolean
}

export function isPracticeNeeded(skillLevelSet: SkillLevelSet, skillId: SkillId, options: PracticeNeededOptions): PracticeNeeded | undefined {
	if (!skillLevelSet.hasRequiredDataFor(skillId)) return undefined
	return calculatePracticeNeeded(skillLevelSet, skillId, options)
}

function calculatePracticeNeeded(skillLevelSet: SkillLevelSet, skillId: SkillId, { skillThresholds, priorKnowledge = false }: PracticeNeededOptions): PracticeNeeded {
	const mastery = priorKnowledge ? skillThresholds.priorKnowledgeMastery : skillThresholds.mastery
	const recap = priorKnowledge ? skillThresholds.priorKnowledgeRecap : skillThresholds.recap
	const expectedSuccessRate = skillLevelSet.getExpectedSuccessRate(skillId)
	if (expectedSuccessRate > mastery) return 0
	if (expectedSuccessRate < recap) return 2
	if (priorKnowledge) return 1
	if (skillLevelSet.getHighestExpectedSuccessRate(skillId) > mastery) return 1
	return 2
}

export function getPracticeNeeded(course: Course, skillLevelSet: SkillLevelSet): PracticeNeededMap | undefined {
	if (course.allSkillIds.some(skillId => !skillLevelSet.hasRequiredDataFor(skillId))) return undefined
	const result: PracticeNeededMap = {}
	course.learningGoalIds.forEach(goalId => checkPracticeNeeded(course.skillTree, goalId, skillLevelSet, course.priorKnowledgeIds, result))
	return result
}

function checkPracticeNeeded(skillTree: SkillTree, skillId: SkillId, skillLevelSet: SkillLevelSet, priorKnowledge: readonly SkillId[], result: PracticeNeededMap, bestParent?: PracticeNeeded): void {
	const skill = skillTree[skillId]
	if (!skill) throw new Error(`Invalid skill: could not find "${skillId}" when processing course data.`)

	const isPriorKnowledge = priorKnowledge.includes(skillId)
	let practiceNeeded = calculatePracticeNeeded(skillLevelSet, skillId, { skillThresholds: skill.thresholds, priorKnowledge: isPriorKnowledge })
	if (bestParent !== undefined) practiceNeeded = Math.min(bestParent, practiceNeeded) as PracticeNeeded

	if (result[skillId] !== undefined && result[skillId] <= practiceNeeded) return
	result[skillId] = practiceNeeded
	if (!isPriorKnowledge) skill.prerequisiteIds.forEach(prerequisiteId => checkPracticeNeeded(skillTree, prerequisiteId, skillLevelSet, priorKnowledge, result, practiceNeeded))
}
