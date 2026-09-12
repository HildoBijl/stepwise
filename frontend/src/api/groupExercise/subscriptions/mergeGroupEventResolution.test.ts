import { describe, expect, it, vi } from 'vitest'

import type { GroupEventResolutionRecord, GroupExerciseEventRecord, GroupExerciseRecord } from '../records.ts'

import { mergeGroupEventResolution } from './mergeGroupEventResolution.ts'

const event = (eventIndex: number): GroupExerciseEventRecord => ({ id: `event-${eventIndex}`, eventIndex, state: null, performedAt: '', actions: [] })
const exercise = { id: 'exercise', eventIndex: 0, history: [event(0)] } as unknown as GroupExerciseRecord

describe('mergeGroupEventResolution', () => {
	it('resolves the current event and appends the next event', () => {
		const { actions: _actions, ...nextEvent } = event(1)
		const resolution: GroupEventResolutionRecord = { exerciseId: 'exercise', eventIndex: 0, state: {}, active: true, nextEvent }
		const result = mergeGroupEventResolution(exercise, resolution, vi.fn())
		expect(result).toMatchObject({ eventIndex: 1, active: true, history: [{ eventIndex: 0, state: {} }, { ...nextEvent, actions: [] }] })
	})

	it('refetches when the next event is not sequential', () => {
		const refetch = vi.fn(async () => undefined)
		const { actions: _actions, ...nextEvent } = event(2)
		const resolution: GroupEventResolutionRecord = { exerciseId: 'exercise', eventIndex: 0, state: {}, active: true, nextEvent }
		expect(mergeGroupEventResolution(exercise, resolution, refetch)).toBe(exercise)
		expect(refetch).toHaveBeenCalledOnce()
	})
})
