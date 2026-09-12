import { describe, expect, it, vi } from 'vitest'

import type { ExerciseRecord, ExerciseUpdateRecord, SkillWithLatestExerciseRecord } from '../records.ts'

import { mergeExerciseUpdate } from './mergeExerciseUpdate.ts'

const exercise = { id: 'exercise', eventIndex: 0, history: [] } as unknown as ExerciseRecord
const skill = { exerciseData: { latestExercise: exercise } } as unknown as SkillWithLatestExerciseRecord
const event = { id: 'event', eventIndex: 0 } as ExerciseUpdateRecord['event']

describe('mergeExerciseUpdate', () => {
	it('appends the next event', () => {
		const result = mergeExerciseUpdate(skill, { exerciseId: 'exercise', active: true, event }, vi.fn())
		expect(result.exerciseData?.latestExercise).toMatchObject({ eventIndex: 1, history: [event] })
	})

	it('refetches when an event is missed', () => {
		const refetch = vi.fn(async () => undefined)
		expect(mergeExerciseUpdate(skill, { exerciseId: 'exercise', active: true, event: { ...event, eventIndex: 1 } }, refetch)).toBe(skill)
		expect(refetch).toHaveBeenCalledOnce()
	})

	it('ignores an event that the mutation response already applied', () => {
		const refetch = vi.fn(async () => undefined)
		const updatedExercise = { ...exercise, eventIndex: 1, history: [event] }
		const updatedSkill = { ...skill, exerciseData: { latestExercise: updatedExercise } } as SkillWithLatestExerciseRecord
		expect(mergeExerciseUpdate(updatedSkill, { exerciseId: 'exercise', active: true, event }, refetch)).toBe(updatedSkill)
		expect(refetch).not.toHaveBeenCalled()
	})
})
