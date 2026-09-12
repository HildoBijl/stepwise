import { describe, expect, it, vi } from 'vitest'

import type { GroupActionUpdateRecord, GroupExerciseActionRecord, GroupExerciseEventRecord, GroupExerciseRecord } from '../records.ts'

import { mergeGroupActionUpdate } from './mergeGroupActionUpdate.ts'

const action = (userId: string): GroupExerciseActionRecord => ({ id: userId, userId, action: { type: 'input' }, performedAt: '' })
const event = { eventIndex: 0, state: null, actions: [action('first-user')] } as GroupExerciseEventRecord
const exercise = { id: 'exercise', eventIndex: 0, history: [event] } as unknown as GroupExerciseRecord
const update = (userId: string, updatedAction: GroupExerciseActionRecord | null): GroupActionUpdateRecord => ({ exerciseId: 'exercise', eventIndex: 0, userId, action: updatedAction })

describe('mergeGroupActionUpdate', () => {
	it('upserts a submitted action', () => {
		const secondAction = action('second-user')
		const result = mergeGroupActionUpdate(exercise, update('second-user', secondAction), vi.fn())
		expect(result?.history[0]?.actions).toStrictEqual([action('first-user'), secondAction])
	})

	it('removes a canceled action', () => {
		const result = mergeGroupActionUpdate(exercise, update('first-user', null), vi.fn())
		expect(result?.history[0]?.actions).toStrictEqual([])
	})

	it('refetches when the event is unavailable', () => {
		const refetch = vi.fn(async () => undefined)
		expect(mergeGroupActionUpdate(exercise, { ...update('first-user', null), eventIndex: 2 }, refetch)).toBe(exercise)
		expect(refetch).toHaveBeenCalledOnce()
	})
})
