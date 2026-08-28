import { describe, expect, it } from 'vitest'

import type { CourseDiagnostics } from './types.ts'
import { validateCourseDiagnostics } from './diagnosticsValidation.ts'

const validDiagnostics: CourseDiagnostics = {
	originalStartingPointIds: [],
	unknownStartingPointIds: [],
	externalStartingPointIds: [],
	redundantStartingPointIds: [],
	missingStartingPointIds: [],
	originalLearningGoalIds: [],
	unknownLearningGoalIds: [],
	redundantLearningGoalIds: [],
}

describe('validateCourseDiagnostics', () => {
	it('accepts diagnostics without issues', () => {
		expect(() => validateCourseDiagnostics(validDiagnostics)).not.toThrow()
	})

	it.each([
		'unknownStartingPointIds',
		'externalStartingPointIds',
		'redundantStartingPointIds',
		'missingStartingPointIds',
		'unknownLearningGoalIds',
		'redundantLearningGoalIds',
	] as const)('rejects non-empty %s', field => {
		expect(() => validateCourseDiagnostics({ ...validDiagnostics, [field]: ['problem'] })).toThrow()
	})

	it.each([
		'unknownLearningGoalIds',
		'externalLearningGoalIds',
		'redundantLearningGoalIds',
	] as const)('rejects block diagnostics with non-empty %s', field => {
		const blockDiagnostic = { unknownLearningGoalIds: [], externalLearningGoalIds: [], redundantLearningGoalIds: [], [field]: ['problem'] }
		expect(() => validateCourseDiagnostics({ ...validDiagnostics, blockDiagnostics: [blockDiagnostic] })).toThrow()
	})

	it('rejects uncovered learning goals', () => {
		expect(() => validateCourseDiagnostics({ ...validDiagnostics, uncoveredLearningGoalIds: ['problem'] })).toThrow()
	})

	it.each(['unknownSetupSkillIds', 'externalSetupSkillIds'] as const)('rejects non-empty %s', field => {
		expect(() => validateCourseDiagnostics({ ...validDiagnostics, [field]: ['problem'] })).toThrow()
	})
})
