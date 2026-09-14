import type { SkillId } from '@step-wise/module-tree-definition'

export const freePracticeRecommendation = 'StepWiseFreePracticeMode' as const

export type PracticeRecommendation = SkillId | typeof freePracticeRecommendation
export type HasExercises = (skillId: SkillId) => boolean

export const allSkillsHaveExercises: HasExercises = () => true
