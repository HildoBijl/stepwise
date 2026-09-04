import type { SkillId, SkillThresholdOptions, SkillTree } from '@step-wise/skill-definition'
import type { Course } from '@step-wise/course-definition'
import type { SkillLevelSet } from '@step-wise/skill-tracking'

export type PracticeNeed = 0 | 1 | 2
export type PracticeNeeds = Partial<Record<SkillId, PracticeNeed>>

export type PracticeNeedOptions = {
	skillThresholds: SkillThresholdOptions
	priorKnowledge?: boolean
}

export function getPracticeNeed(skillLevelSet: SkillLevelSet, skillId: SkillId, options: PracticeNeedOptions): PracticeNeed | undefined {
	if (!skillLevelSet.hasRequiredDataFor(skillId)) return undefined
	return calculatePracticeNeed(skillLevelSet, skillId, options)
}

function calculatePracticeNeed(skillLevelSet: SkillLevelSet, skillId: SkillId, { skillThresholds, priorKnowledge = false }: PracticeNeedOptions): PracticeNeed {
	const mastery = priorKnowledge ? skillThresholds.priorKnowledgeMastery : skillThresholds.mastery
	const recap = priorKnowledge ? skillThresholds.priorKnowledgeRecap : skillThresholds.recap
	const expectedSuccessRate = skillLevelSet.getExpectedSuccessRate(skillId)
	if (expectedSuccessRate > mastery) return 0
	if (expectedSuccessRate < recap) return 2
	if (priorKnowledge) return 1
	if (skillLevelSet.getHighestExpectedSuccessRate(skillId) > mastery) return 1
	return 2
}

export function getCoursePracticeNeeds(course: Course, skillLevelSet: SkillLevelSet): PracticeNeeds | undefined {
	if (course.allSkillIds.some(skillId => !skillLevelSet.hasRequiredDataFor(skillId))) return undefined

	const practiceNeeds: PracticeNeeds = {}
	course.learningGoalIds.forEach(goalId => collectPracticeNeeds(course.skillTree, goalId, skillLevelSet, course.priorKnowledgeIds, practiceNeeds))
	return practiceNeeds
}

function collectPracticeNeeds(skillTree: SkillTree, skillId: SkillId, skillLevelSet: SkillLevelSet, priorKnowledge: readonly SkillId[], practiceNeeds: PracticeNeeds, maximumPracticeNeed?: PracticeNeed): void {
	const skill = skillTree[skillId]
	if (!skill) throw new Error(`Invalid skill: could not find "${skillId}" when processing course data.`)

	const isPriorKnowledge = priorKnowledge.includes(skillId)
	let practiceNeed = calculatePracticeNeed(skillLevelSet, skillId, { skillThresholds: skill.thresholds, priorKnowledge: isPriorKnowledge })
	if (maximumPracticeNeed !== undefined) practiceNeed = Math.min(maximumPracticeNeed, practiceNeed) as PracticeNeed

	if (practiceNeeds[skillId] !== undefined && practiceNeeds[skillId] <= practiceNeed) return
	practiceNeeds[skillId] = practiceNeed
	if (!isPriorKnowledge) skill.prerequisiteIds.forEach(prerequisiteId => collectPracticeNeeds(skillTree, prerequisiteId, skillLevelSet, priorKnowledge, practiceNeeds, practiceNeed))
}
