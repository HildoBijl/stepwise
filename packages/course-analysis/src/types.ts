import type { SkillId, SkillTree } from '@step-wise/skill-definition'
import type { SkillLevelData, SkillLevelSet } from '@step-wise/skill-tracking'

export const freePracticeRecommendation = 'StepWiseFreePracticeMode' as const

export type PracticeNeeded = 0 | 1 | 2
export type PracticeNeededMap = Partial<Record<SkillId, PracticeNeeded>>
export type HasExercises = (skillId: SkillId) => boolean

export type CourseProgressAnalysis = {
	practiceNeeded: PracticeNeededMap
	recommendation: SkillId | typeof freePracticeRecommendation
}

export type SkillAdvice = {
	type?: PracticeNeeded
	recommendation?: SkillId | typeof freePracticeRecommendation
}

export type CourseAnalysisContext = {
	skillTree: SkillTree
	hasExercises: HasExercises
}

export type StudentSkillData = SkillLevelData & {
	updatedAt: Date | string
}

export type StudentData = {
	skills: StudentSkillData[]
}

export type ProcessedStudent<TStudent extends StudentData> = Omit<TStudent, 'skills'> & {
	skills: TStudent['skills']
	skillLevelSet: SkillLevelSet
	analysis: CourseProgressAnalysis
	numCompleted: number
	numCompletedPerBlock: number[]
	lastActive: Date | undefined
}
