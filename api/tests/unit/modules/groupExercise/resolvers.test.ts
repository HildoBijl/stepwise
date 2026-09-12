import { describe, expect, it } from 'vitest'

import type { GroupExerciseSampleWithEvents } from '../../../../src/modules/groupExercise/models.ts'
import type { GroupExerciseUpdatedPayload } from '../../../../src/modules/groupExercise/service.ts'
import { selectGroupExerciseUpdate, selectLatestGroupExerciseUpdate } from '../../../../src/modules/groupExercise/resolvers.ts'

const exercise = { id: 'exercise-id', skillId: 'enterInteger' } as GroupExerciseSampleWithEvents
const payload: GroupExerciseUpdatedPayload = { updatedGroupExercise: exercise, code: 'PHYS', action: 'submitAction' }

describe('latest group exercise subscription', () => {
	it('selects updates for the requested group and skill', () => {
		expect(selectLatestGroupExerciseUpdate(payload, { code: 'phys', skillId: 'enterInteger' })).toBe(exercise)
	})

	it('ignores updates for another group or skill', () => {
		expect(selectLatestGroupExerciseUpdate(payload, { code: 'MATH', skillId: 'enterInteger' })).toBeUndefined()
		expect(selectLatestGroupExerciseUpdate(payload, { code: 'PHYS', skillId: 'enterFloat' })).toBeUndefined()
	})
})

describe('group exercise subscription', () => {
	it('selects updates for the requested exercise', () => {
		expect(selectGroupExerciseUpdate(payload, { exerciseId: 'exercise-id' })).toBe(exercise)
		expect(selectGroupExerciseUpdate(payload, { exerciseId: 'other-exercise' })).toBeUndefined()
	})
})
