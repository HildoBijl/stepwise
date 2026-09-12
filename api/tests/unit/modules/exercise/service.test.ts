import { describe, expect, it } from 'vitest'

import type { ExerciseEventRecord, ExerciseSampleRecord } from '../../../../src/modules/exercise/index.ts'
import { getCurrentExerciseState, getExerciseEventIndex, getLatestExerciseEvent } from '../../../../src/modules/exercise/service.ts'

describe('exercise state helpers', () => {
	const initialState = { initial: true }

	it('uses the initial state when no events exist or are loaded', () => {
		const exercise = { initialState, events: [] } as unknown as ExerciseSampleRecord
		expect(getLatestExerciseEvent(exercise)).toBeNull()
		expect(getExerciseEventIndex(exercise)).toBe(0)
		expect(getCurrentExerciseState(exercise)).toBe(initialState)
		expect(getCurrentExerciseState({ initialState } as unknown as ExerciseSampleRecord)).toBe(initialState)
	})

	it('uses the final event in the loaded chronological sequence', () => {
		const first = { state: { step: 1 } } as unknown as ExerciseEventRecord
		const latest = { eventIndex: 1, state: { step: 2 } } as unknown as ExerciseEventRecord
		const exercise = { initialState, events: [first, latest] } as unknown as ExerciseSampleRecord
		expect(getLatestExerciseEvent(exercise)).toBe(latest)
		expect(getExerciseEventIndex(exercise)).toBe(2)
		expect(getCurrentExerciseState(exercise)).toBe(latest.state)
	})
})
