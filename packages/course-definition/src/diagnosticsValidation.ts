import type { CourseBlockDiagnostics, CourseDiagnostics } from './types'

export function validateCourseDiagnostics(diagnostics: CourseDiagnostics): void {
	validateCourseEndpoints(diagnostics)
	validateCourseBlocks(diagnostics)
	validateCourseSetup(diagnostics)
}

function validateCourseEndpoints(diagnostics: CourseDiagnostics): void {
	const { unknownLearningGoalIds, unknownStartingPointIds, externalStartingPointIds, missingStartingPointIds, redundantStartingPointIds, redundantLearningGoalIds } = diagnostics

	if (unknownStartingPointIds.length > 0) throw new Error(`Invalid course starting points: there are unknown skills. Check out ${JSON.stringify(unknownStartingPointIds)}.`)
	if (externalStartingPointIds.length > 0) throw new Error(`Invalid course starting points: there are starting points that are not required for any of the learning goals. Check out ${JSON.stringify(externalStartingPointIds)}.`)
	if (redundantStartingPointIds.length > 0) throw new Error(`Invalid course starting points: there are redundant starting points. You do not need to add ${JSON.stringify(redundantStartingPointIds)}.`)
	if (missingStartingPointIds.length > 0) throw new Error(`Invalid course starting points: there are missing starting points. Consider adding ${JSON.stringify(missingStartingPointIds)} or otherwise prerequisites/follow-ups of them.`)

	if (unknownLearningGoalIds.length > 0) throw new Error(`Invalid course learning goals: there are unknown skills. Check out ${JSON.stringify(unknownLearningGoalIds)}.`)
	if (redundantLearningGoalIds.length > 0) throw new Error(`Invalid course learning goals: there are redundant learning goals. You do not need to add ${JSON.stringify(redundantLearningGoalIds)}.`)
}

function validateCourseBlocks(diagnostics: CourseDiagnostics): void {
	const { blockDiagnostics, uncoveredLearningGoalIds } = diagnostics
	if (blockDiagnostics) blockDiagnostics.forEach((blockDiagnostic, index) => validateCourseBlockDiagnostics(blockDiagnostic, index))
	if (uncoveredLearningGoalIds && uncoveredLearningGoalIds.length > 0) throw new Error(`Invalid course block goals: the blocks together should cover all learning goals, but ${JSON.stringify(uncoveredLearningGoalIds)} are not covered.`)
}

function validateCourseBlockDiagnostics(diagnostics: CourseBlockDiagnostics, index: number): void {
	const { unknownLearningGoalIds, externalLearningGoalIds, redundantLearningGoalIds } = diagnostics
	const block = `block ${index + 1}`
	if (unknownLearningGoalIds.length > 0) throw new Error(`Invalid course block goals: ${block} has unknown learning goals. Check out ${JSON.stringify(unknownLearningGoalIds)}.`)
	if (externalLearningGoalIds.length > 0) throw new Error(`Invalid course block goals: ${block} has learning goals that are not part of the course. Check out ${JSON.stringify(externalLearningGoalIds)}.`)
	if (redundantLearningGoalIds.length > 0) throw new Error(`Invalid course block goals: ${block} has learning goals that were already treated in an earlier block. You do not need to add ${JSON.stringify(redundantLearningGoalIds)}.`)
}

function validateCourseSetup(diagnostics: CourseDiagnostics): void {
	const { unknownSetupSkillIds, externalSetupSkillIds } = diagnostics
	if (unknownSetupSkillIds && unknownSetupSkillIds.length > 0) throw new Error(`Invalid course set-up: the set-up references unknown skills. Check out ${JSON.stringify(unknownSetupSkillIds)}.`)
	if (externalSetupSkillIds && externalSetupSkillIds.length > 0) throw new Error(`Invalid course set-up: the set-up references skills that are not part of the course. Check out ${JSON.stringify(externalSetupSkillIds)}.`)
}
