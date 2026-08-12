import type { CourseBlockIssues, CourseDiagnostics } from './types'

export function ensureValidCourseDiagnostics(diagnostics: CourseDiagnostics): void {
	ensureValidCourseEndpoints(diagnostics)
	ensureValidCourseBlocks(diagnostics)
	ensureValidCourseSetup(diagnostics)
}

function ensureValidCourseEndpoints(diagnostics: CourseDiagnostics): void {
	const { unknownLearningGoals, unknownStartingPoints, externalStartingPoints, missingStartingPoints, superfluousStartingPoints, superfluousLearningGoals } = diagnostics

	if (unknownStartingPoints.length > 0) throw new Error(`Invalid course starting points: there are unknown skills. Check out ${JSON.stringify(unknownStartingPoints)}.`)
	if (externalStartingPoints.length > 0) throw new Error(`Invalid course starting points: there are starting points that are not required for any of the learning goals. Check out ${JSON.stringify(externalStartingPoints)}.`)
	if (superfluousStartingPoints.length > 0) throw new Error(`Invalid course starting points: there are superfluous starting points. You do not need to add ${JSON.stringify(superfluousStartingPoints)}.`)
	if (missingStartingPoints.length > 0) throw new Error(`Invalid course starting points: there are missing starting points. Consider adding ${JSON.stringify(missingStartingPoints)} or otherwise prerequisites/follow-ups of them.`)

	if (unknownLearningGoals.length > 0) throw new Error(`Invalid course learning goals: there are unknown skills. Check out ${JSON.stringify(unknownLearningGoals)}.`)
	if (superfluousLearningGoals.length > 0) throw new Error(`Invalid course learning goals: there are superfluous learning goals. You do not need to add ${JSON.stringify(superfluousLearningGoals)}.`)
}

function ensureValidCourseBlocks(diagnostics: CourseDiagnostics): void {
	const { blockIssues, uncoveredLearningGoals } = diagnostics
	if (blockIssues) blockIssues.forEach((issues, index) => ensureValidCourseBlockIssues(issues, index))
	if (uncoveredLearningGoals && uncoveredLearningGoals.length > 0) throw new Error(`Invalid course block goals: the blocks together should cover all learning goals, but ${JSON.stringify(uncoveredLearningGoals)} are not covered.`)
}

function ensureValidCourseBlockIssues(issues: CourseBlockIssues, index: number): void {
	const { unknownLearningGoals, externalLearningGoals, superfluousLearningGoals } = issues
	const block = `block ${index + 1}`
	if (unknownLearningGoals.length > 0) throw new Error(`Invalid course block goals: ${block} has unknown learning goals. Check out ${JSON.stringify(unknownLearningGoals)}.`)
	if (externalLearningGoals.length > 0) throw new Error(`Invalid course block goals: ${block} has learning goals that are not part of the course. Check out ${JSON.stringify(externalLearningGoals)}.`)
	if (superfluousLearningGoals.length > 0) throw new Error(`Invalid course block goals: ${block} has learning goals that were already treated in an earlier block. You do not need to add ${JSON.stringify(superfluousLearningGoals)}.`)
}

function ensureValidCourseSetup(diagnostics: CourseDiagnostics): void {
	const { unknownSetupSkills, externalSetupSkills } = diagnostics
	if (unknownSetupSkills && unknownSetupSkills.length > 0) throw new Error(`Invalid course set-up: the set-up references unknown skills. Check out ${JSON.stringify(unknownSetupSkills)}.`)
	if (externalSetupSkills && externalSetupSkills.length > 0) throw new Error(`Invalid course set-up: the set-up references skills that are not part of the course. Check out ${JSON.stringify(externalSetupSkills)}.`)
}
