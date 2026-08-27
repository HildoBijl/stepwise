import type { GroupExerciseEventRecord, GroupExerciseSampleRecord } from '../../../../src/modules/groupExercise/index.ts'
import { getCurrentGroupExerciseState } from '../../../../src/modules/groupExercise/service.ts'

describe('group-exercise state helpers', () => {
	it('uses initial state when there is no resolved event', () => {
		const initialState = { initial: true }
		expect(getCurrentGroupExerciseState({ initialState, events: [] } as unknown as GroupExerciseSampleRecord)).toBe(initialState)
		expect(getCurrentGroupExerciseState({ initialState, events: [{ state: null }] } as unknown as GroupExerciseSampleRecord)).toBe(initialState)
	})

	it('uses the most recently updated resolved event and ignores pending events', () => {
		const older = { state: { step: 1 }, updatedAt: new Date('2024-01-01') } as unknown as GroupExerciseEventRecord
		const latest = { state: { step: 2 }, updatedAt: new Date('2024-01-03') } as unknown as GroupExerciseEventRecord
		const pending = { state: null, updatedAt: new Date('2024-01-04') } as unknown as GroupExerciseEventRecord
		const exercise = { initialState: {}, events: [latest, pending, older] } as unknown as GroupExerciseSampleRecord
		expect(getCurrentGroupExerciseState(exercise)).toBe(latest.state)
	})
})
