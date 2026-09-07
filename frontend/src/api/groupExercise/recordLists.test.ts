import { describe, expect, it } from 'vitest'

import type { GroupExerciseRecord } from './records.ts'
import { upsertGroupExerciseRecord } from './recordLists.ts'

const exercise = { __typename: 'GroupExercise', id: 'exercise-1', skillId: 'demo' } as GroupExerciseRecord

describe('group-exercise record-list updates', () => {
	it('replaces an exercise for an existing skill', () => {
		const replacement = { ...exercise, id: 'exercise-2' }
		expect(upsertGroupExerciseRecord(replacement, [exercise])).toEqual([replacement])
	})

	it('adds an exercise for a new skill', () => {
		const newExercise = { ...exercise, skillId: 'test' }
		expect(upsertGroupExerciseRecord(newExercise, [exercise])).toEqual([exercise, newExercise])
	})
})
