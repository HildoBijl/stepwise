import { describe, expect, it } from 'vitest'

import { isMonoExercise } from './guards.ts'

const exercise = {
	metadata: {},
	generateParameters: () => ({}),
	getInitialState: () => ({}),
	processSoloAction: () => ({}),
	processGroupActions: () => ({}),
	checkInput: () => true,
	valueOperations: { deserializeParameters: () => ({}), interpretInput: () => ({}), toInputValue: () => ({ type: 'Integer', value: '0' }), areValuesEqual: () => true },
}

describe('isMonoExercise', () => {
	it('recognizes mono exercises by their discriminator', () => {
		expect(isMonoExercise({ ...exercise, type: 'mono' })).toBe(true)
		expect(isMonoExercise({ ...exercise, type: 'step', metadata: { steps: [] } })).toBe(false)
	})
})
