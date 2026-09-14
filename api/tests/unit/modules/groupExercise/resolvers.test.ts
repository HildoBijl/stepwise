import { describe, expect, it } from 'vitest'

import type { GroupExerciseSampleWithEvents } from '../../../../src/modules/groupExercise/models.ts'
import type { GroupActionUpdatedPayload, GroupEventResolvedPayload, GroupExerciseStartedPayload } from '../../../../src/modules/groupExercise/service.ts'
import { selectGroupActionUpdate, selectGroupEventResolution, selectStartedGroupExercise } from '../../../../src/modules/groupExercise/resolvers/subscriptions.ts'

const exercise = { id: 'exercise-id', skillId: 'enterInteger' } as GroupExerciseSampleWithEvents
const context = { userId: 'user-id' } as Parameters<typeof selectGroupActionUpdate>[2]
const startedPayload: GroupExerciseStartedPayload = { exercise, code: 'PHYS', memberIds: ['user-id'] }
const actionPayload: GroupActionUpdatedPayload = { exerciseId: 'exercise-id', eventIndex: 0, userId: 'user-id', action: null, memberIds: ['user-id'] }
const resolutionPayload: GroupEventResolvedPayload = { exerciseId: 'exercise-id', eventIndex: 0, state: {}, report: null, active: false, nextEvent: null, memberIds: ['user-id'] }

describe('group exercise started subscription', () => {
	it('selects starts for a member of the requested group and skill', () => {
		expect(selectStartedGroupExercise(startedPayload, { code: 'phys', skillId: 'enterInteger' }, context)).toBe(exercise)
	})

	it('ignores starts for another group, skill or non-member', () => {
		expect(selectStartedGroupExercise(startedPayload, { code: 'MATH', skillId: 'enterInteger' }, context)).toBeUndefined()
		expect(selectStartedGroupExercise(startedPayload, { code: 'PHYS', skillId: 'enterFloat' }, context)).toBeUndefined()
		expect(selectStartedGroupExercise(startedPayload, { code: 'PHYS', skillId: 'enterInteger' }, { ...context, userId: 'other-user' })).toBeUndefined()
	})
})

describe('group action subscription', () => {
	it('selects updates for a member subscribed to the requested exercise', () => {
		expect(selectGroupActionUpdate(actionPayload, { exerciseId: 'exercise-id' }, context)).toBe(actionPayload)
	})

	it('ignores updates for another exercise or a former member', () => {
		expect(selectGroupActionUpdate(actionPayload, { exerciseId: 'other-exercise' }, context)).toBeUndefined()
		expect(selectGroupActionUpdate(actionPayload, { exerciseId: 'exercise-id' }, { ...context, userId: 'other-user' })).toBeUndefined()
	})
})

describe('group event resolution subscription', () => {
	it('only selects resolutions for current members subscribed to the exercise', () => {
		expect(selectGroupEventResolution(resolutionPayload, { exerciseId: 'exercise-id' }, context)).toBe(resolutionPayload)
		expect(selectGroupEventResolution(resolutionPayload, { exerciseId: 'other-exercise' }, context)).toBeUndefined()
		expect(selectGroupEventResolution(resolutionPayload, { exerciseId: 'exercise-id' }, { ...context, userId: 'other-user' })).toBeUndefined()
	})
})
