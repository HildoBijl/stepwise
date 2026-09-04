import type { SkillId, SkillTree } from '@step-wise/skill-definition'

export const freePracticeRecommendation = 'StepWiseFreePracticeMode' as const

export type PracticeRecommendation = SkillId | typeof freePracticeRecommendation
export type HasExercises = (skillId: SkillId) => boolean

export type CourseAnalysisContext = {
	skillTree: SkillTree
	hasExercises: HasExercises
}
