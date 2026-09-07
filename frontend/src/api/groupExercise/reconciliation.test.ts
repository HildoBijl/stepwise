import { describe, expect, it } from 'vitest'

import type { GroupExerciseRecord } from './records.ts'
import { addGroupExerciseToList } from './reconciliation.ts'

const exercise = { __typename: 'GroupExercise', id: 'exercise-1', skillId: 'demo' } as GroupExerciseRecord

describe('group-exercise subscription reconciliation', () => {
	it('replaces exercises by skill and adds exercises for new skills', () => {
		const replacement = { ...exercise, id: 'exercise-2' }
		expect(addGroupExerciseToList(replacement, [exercise])).toEqual([replacement])
		expect(addGroupExerciseToList({ ...exercise, skillId: 'test' }, [exercise])).toHaveLength(2)
	})
})
