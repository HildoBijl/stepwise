import { type SkillId, type SkillTree, createSkillTree } from '@step-wise/skill-definition'
import { Course } from '@step-wise/course-definition'
import { type StoredSkillLevel, type StoredSkillLevelSet, SkillLevelSet } from '@step-wise/skill-tracking'

import type { PracticeNeed } from './practiceNeeds.ts'

export const now = new Date('2026-01-01T12:00:00.000Z')

export const skillTree = createSkillTree({
	foundation: { name: 'Foundation' },
	basic: { name: 'Basic', prerequisites: ['foundation'] },
	intermediate: { name: 'Intermediate', prerequisites: ['basic'] },
	advanced: { name: 'Advanced', prerequisites: ['intermediate'] },
	alternative: { name: 'Alternative', prerequisites: ['basic'] },
	outside: { name: 'Outside' },
})

export const course = new Course(skillTree, {
	startingPointIds: ['basic'],
	learningGoalIds: ['advanced'],
	blockLearningGoalIds: [['intermediate'], ['advanced']],
})

const coefficientsByPracticeNeed: Record<PracticeNeed, Pick<StoredSkillLevel, 'coefficients' | 'highest'>> = {
	0: { coefficients: [0, 1], highest: [0, 1] },
	1: { coefficients: [1], highest: [0, 1] },
	2: { coefficients: [1, 0], highest: [1, 0] },
}

export function createSkillLevelSet(tree: SkillTree, practiceNeeds: Partial<Record<SkillId, PracticeNeed>> = {}, omittedSkillIds: readonly SkillId[] = []): SkillLevelSet {
	const storedSkillLevels = Object.fromEntries(Object.keys(tree)
		.filter(skillId => !omittedSkillIds.includes(skillId))
		.map(skillId => {
			const distributions = coefficientsByPracticeNeed[practiceNeeds[skillId] ?? 0]
			return [skillId, { ...distributions, coefficientsOn: now, highestOn: now, numPracticed: 1 }]
		})) as StoredSkillLevelSet
	return new SkillLevelSet(tree, storedSkillLevels)
}
