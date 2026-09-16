import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getExercise } from '@step-wise/exercises'

import { getCompatibleExerciseDefinition, isExerciseCompatible } from '../../../../src/modules/exercise/compatibility.ts'

vi.mock('@step-wise/exercises', () => ({ getExercise: vi.fn() }))

const definition = {
	metadata: { version: 2 },
	generateParameters: () => ({}),
	getInitialState: () => ({}),
	processSoloAction: () => ({ state: {} }),
}

describe('exercise compatibility', () => {
	beforeEach(() => { vi.mocked(getExercise).mockReset() })

	it('returns a definition when its resolved version matches', () => {
		vi.mocked(getExercise).mockReturnValue(definition)
		expect(getCompatibleExerciseDefinition('skill', { exerciseId: 'exercise', exerciseVersion: 2 })).toBe(definition)
		expect(isExerciseCompatible('skill', { exerciseId: 'exercise', exerciseVersion: 2 })).toBe(true)
	})

	it('uses the default definition version', () => {
		vi.mocked(getExercise).mockReturnValue({ ...definition, metadata: {} })
		expect(isExerciseCompatible('skill', { exerciseId: 'exercise', exerciseVersion: 1 })).toBe(true)
	})

	it('rejects version mismatches and missing definitions', () => {
		vi.mocked(getExercise).mockReturnValue(definition)
		expect(isExerciseCompatible('skill', { exerciseId: 'exercise', exerciseVersion: 1 })).toBe(false)
		vi.mocked(getExercise).mockReturnValue(undefined)
		expect(isExerciseCompatible('skill', { exerciseId: 'exercise', exerciseVersion: 2 })).toBe(false)
	})
})
