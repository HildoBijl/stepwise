import { describe, expect, it } from 'vitest'

import type { GroupExerciseRecord, GroupRecord } from './records.ts'
import { groupExerciseRecordToExercise, groupRecordToGroup } from './conversion.ts'

const groupRecord: GroupRecord = {
	__typename: 'Group',
	code: 'ABCD',
	members: [{
		groupId: 'group-id',
		userId: 'user-id',
		name: null,
		givenName: 'Alex',
		familyName: null,
		active: true,
		lastActivity: '2026-01-01T00:00:00.000Z',
	}],
}

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

describe('group API conversion', () => {
	it('converts member dates and omits nullable names', () => {
		const group = groupRecordToGroup(groupRecord)
		expect(group.members[0]).toEqual({
			groupId: 'group-id',
			userId: 'user-id',
			givenName: 'Alex',
			active: true,
			lastActivity: new Date('2026-01-01T00:00:00.000Z'),
		})
	})

	it('converts exercise dates and omits unresolved event state', () => {
		const exercise = groupExerciseRecordToExercise(exerciseRecord)
		expect(exercise.startedAt).toEqual(new Date('2026-01-01T00:00:00.000Z'))
		expect(exercise.state).toBeUndefined()
		expect(exercise.history[0]?.performedAt).toEqual(new Date('2026-01-01T00:01:00.000Z'))
		expect(exercise.history[0]?.state).toBeUndefined()
		expect(exercise.history[0]?.actions[0]?.performedAt).toEqual(new Date('2026-01-01T00:01:00.000Z'))
	})
})
