import { describe, expect, it } from 'vitest'

import type { GroupExerciseRecord } from './records.ts'
import { groupExerciseRecordToExercise } from './conversion.ts'

const exerciseRecord: GroupExerciseRecord = {
	__typename: 'GroupExercise',
	id: 'exercise-id',
	skillId: 'demo',
	exerciseId: 'enterInteger',
	mode: 'group',
	parameters: { x: 20 },
	initialState: {},
	active: true,
	startedAt: '2026-01-01T00:00:00.000Z',
	state: null,
	history: [{
		id: 'event-id',
		state: null,
		performedAt: '2026-01-01T00:01:00.000Z',
		actions: [{
			id: 'action-id',
			userId: 'user-id',
			action: { type: 'input', input: '20' },
			performedAt: '2026-01-01T00:01:00.000Z',
		}],
	}],
}

describe('group-exercise API conversion', () => {
	it('converts dates and omits unresolved state', () => {
		const exercise = groupExerciseRecordToExercise(exerciseRecord)
		expect(exercise.startedAt).toEqual(new Date('2026-01-01T00:00:00.000Z'))
		expect(exercise.state).toBeUndefined()
		expect(exercise.history[0]?.performedAt).toEqual(new Date('2026-01-01T00:01:00.000Z'))
		expect(exercise.history[0]?.state).toBeUndefined()
		expect(exercise.history[0]?.actions[0]?.performedAt).toEqual(new Date('2026-01-01T00:01:00.000Z'))
	})
})
