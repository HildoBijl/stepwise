import { describe, expect, it } from 'vitest'

import { isStepExercise } from './guards.ts'

const exercise = {
	generateParameters: () => ({}),
	getInitialState: () => ({}),
	processSoloAction: () => ({}),
	processGroupActions: () => ({}),
	checkInput: () => true,
}

describe('isStepExercise', () => {
	it('recognizes step exercises with step metadata', () => {
		expect(isStepExercise({ ...exercise, type: 'step', metadata: { steps: [] } })).toBe(true)
		expect(isStepExercise({ ...exercise, type: 'step', metadata: {} })).toBe(false)
		expect(isStepExercise({ ...exercise, type: 'mono', metadata: {} })).toBe(false)
	})
})
