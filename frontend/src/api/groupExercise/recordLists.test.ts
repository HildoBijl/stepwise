import { describe, expect, it } from 'vitest'

import type { GroupExerciseRecord } from './records.ts'
import { addGroupExerciseRecordToList } from './recordLists.ts'

const exercise = { __typename: 'GroupExercise', id: 'exercise-1', skillId: 'demo' } as GroupExerciseRecord

describe('group-exercise record-list updates', () => {
	it('replaces exercises by skill and adds exercises for new skills', () => {
		const replacement = { ...exercise, id: 'exercise-2' }
		expect(addGroupExerciseRecordToList(replacement, [exercise])).toEqual([replacement])
		expect(addGroupExerciseRecordToList({ ...exercise, skillId: 'test' }, [exercise])).toHaveLength(2)
	})
})
