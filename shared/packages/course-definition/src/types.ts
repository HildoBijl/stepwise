import type { SkillId, SkillSetup, SkillSetupLike } from '@step-wise/skill-setup'

export type CourseData = {
	startingPoints: readonly SkillId[]
	learningGoals: readonly SkillId[]
	goalWeights?: readonly number[]
	blockGoals?: readonly SkillId[][]
	setup?: SkillSetupLike
}

export type ResolvedCourse = {
	readonly priorKnowledge: readonly SkillId[]
	readonly startingPoints: readonly SkillId[]
	readonly contents: readonly SkillId[]
	readonly allSkills: readonly SkillId[]
	
	readonly learningGoals: readonly SkillId[]
	readonly learningGoalWeights: readonly number[]

	readonly blocks?: readonly ResolvedCourseBlock[]
	readonly setup?: SkillSetup
}

export type ResolvedCourseBlock = {
	readonly learningGoals: readonly SkillId[]
	readonly contents: readonly SkillId[]
}

export type CourseDiagnostics = {
	readonly originalStartingPoints: readonly SkillId[]
	readonly unknownStartingPoints: readonly SkillId[]
	readonly externalStartingPoints: readonly SkillId[]
	readonly superfluousStartingPoints: readonly SkillId[]
	readonly missingStartingPoints: readonly SkillId[]

	readonly originalLearningGoals: readonly SkillId[]
	readonly unknownLearningGoals: readonly SkillId[]
	readonly superfluousLearningGoals: readonly SkillId[]

	readonly blockIssues?: readonly CourseBlockIssues[]
	readonly uncoveredLearningGoals?: readonly SkillId[]

	readonly unknownSetupSkills?: readonly SkillId[]
	readonly externalSetupSkills?: readonly SkillId[]
}

export type CourseBlockIssues = {
	readonly unknownLearningGoals: readonly SkillId[]
	readonly externalLearningGoals: readonly SkillId[]
	readonly superfluousLearningGoals: readonly SkillId[]
}

export type CourseAnalysis = {
	readonly course: ResolvedCourse
	readonly diagnostics: CourseDiagnostics
}
