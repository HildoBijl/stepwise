import { describe, expect, it } from 'vitest'

import type { GroupExerciseEventRecord, GroupExerciseSampleRecord } from '../../../../src/modules/groupExercise/index.ts'
import { getCurrentGroupExerciseState, getGroupExerciseEventIndex } from '../../../../src/modules/groupExercise/service.ts'

describe('group-exercise state helpers', () => {
	it('uses initial state when there is no resolved event', () => {
		const initialState = { initial: true }
		expect(getCurrentGroupExerciseState({ initialState, events: [] } as unknown as GroupExerciseSampleRecord)).toBe(initialState)
		expect(getCurrentGroupExerciseState({ initialState, events: [{ state: null }] } as unknown as GroupExerciseSampleRecord)).toBe(initialState)
	})

	it('uses the final resolved event in the loaded event sequence and ignores pending events', () => {
		const older = { eventIndex: 0, state: { step: 1 } } as unknown as GroupExerciseEventRecord
		const latest = { eventIndex: 1, state: { step: 2 } } as unknown as GroupExerciseEventRecord
		const pending = { eventIndex: 2, state: null } as unknown as GroupExerciseEventRecord
		const exercise = { initialState: {}, events: [older, latest, pending] } as unknown as GroupExerciseSampleRecord
		expect(getCurrentGroupExerciseState(exercise)).toBe(latest.state)
		expect(getGroupExerciseEventIndex(exercise)).toBe(2)
	})
})
