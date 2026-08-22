import type { SkillId, SkillSetup, SkillSetupLike } from '@step-wise/skill-setup'

export type CourseDefinition = {
	startingPointIds: readonly SkillId[]
	learningGoalIds: readonly SkillId[]
	learningGoalWeights?: readonly number[]
	blockLearningGoalIds?: readonly (readonly SkillId[])[]
	setup?: SkillSetupLike
}

export type CourseResolution = {
	readonly priorKnowledgeIds: readonly SkillId[]
	readonly startingPointIds: readonly SkillId[]
	readonly contentSkillIds: readonly SkillId[]
	readonly allSkillIds: readonly SkillId[]
	
	readonly learningGoalIds: readonly SkillId[]
	readonly learningGoalWeights: readonly number[]

	readonly blocks?: readonly CourseResolutionBlock[]
	readonly setup?: SkillSetup
}

export type CourseResolutionBlock = {
	readonly learningGoalIds: readonly SkillId[]
	readonly contentSkillIds: readonly SkillId[]
}

export type CourseDiagnostics = {
	readonly originalStartingPointIds: readonly SkillId[]
	readonly unknownStartingPointIds: readonly SkillId[]
	readonly externalStartingPointIds: readonly SkillId[]
	readonly redundantStartingPointIds: readonly SkillId[]
	readonly missingStartingPointIds: readonly SkillId[]

	readonly originalLearningGoalIds: readonly SkillId[]
	readonly unknownLearningGoalIds: readonly SkillId[]
	readonly redundantLearningGoalIds: readonly SkillId[]

	readonly blockDiagnostics?: readonly CourseBlockDiagnostics[]
	readonly uncoveredLearningGoalIds?: readonly SkillId[]

	readonly unknownSetupSkillIds?: readonly SkillId[]
	readonly externalSetupSkillIds?: readonly SkillId[]
}

export type CourseBlockDiagnostics = {
	readonly unknownLearningGoalIds: readonly SkillId[]
	readonly externalLearningGoalIds: readonly SkillId[]
	readonly redundantLearningGoalIds: readonly SkillId[]
}

export type CourseAnalysis = {
	readonly resolution: CourseResolution
	readonly diagnostics: CourseDiagnostics
}
