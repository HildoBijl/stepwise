import { describe, expect, it, vi } from 'vitest'

import { type UserSkillRecord, createSkillResolverSource } from '../../../../src/modules/skill/index.ts'
import type { ExerciseSampleRecord } from '../../../../src/modules/exercise/models.ts'
import type { ExerciseUpdatedPayload } from '../../../../src/modules/exercise/service.ts'
import { exerciseResolvers } from '../../../../src/modules/exercise/resolvers/index.ts'
import { selectExerciseUpdate, selectStartedExercise } from '../../../../src/modules/exercise/resolvers/subscriptions.ts'

vi.mock('@step-wise/exercises', () => ({ getExercise: () => ({ metadata: { version: 1 } }) }))

describe('exercise resolvers', () => {
	it('only exposes exercise data when the skill grants access', () => {
		const skill = {} as UserSkillRecord

		expect(exerciseResolvers.Skill.exerciseData(createSkillResolverSource(skill, false))).toBeNull()
		expect(exerciseResolvers.Skill.exerciseData(createSkillResolverSource(skill, true))).toBe(skill)
	})
})

const exercise = { id: 'exercise-id', exerciseId: 'enterInteger', exerciseVersion: 1 } as ExerciseSampleRecord
const payload: ExerciseUpdatedPayload = { updatedExercise: exercise, userId: 'user-id', skillId: 'enterInteger' }
const context = { userId: 'user-id' } as Parameters<typeof selectExerciseUpdate>[2]

describe('exercise subscriptions', () => {
	it('selects started exercises for the signed-in user and requested skill', () => {
		expect(selectStartedExercise(payload, { skillId: 'enterInteger' }, context)).toBe(exercise)
		expect(selectStartedExercise(payload, { skillId: 'enterFloat' }, context)).toBeUndefined()
		expect(selectStartedExercise(payload, { skillId: 'enterInteger' }, { ...context, userId: 'other-user' })).toBeUndefined()
	})

	it('selects exact-exercise updates for the signed-in owner', () => {
		expect(selectExerciseUpdate(payload, { exerciseId: 'exercise-id' }, context)).toBe(payload)
		expect(selectExerciseUpdate(payload, { exerciseId: 'other-exercise' }, context)).toBeUndefined()
		expect(selectExerciseUpdate(payload, { exerciseId: 'exercise-id' }, { ...context, userId: 'other-user' })).toBeUndefined()
	})

	it('ignores stale exercises', () => {
		const stalePayload = { ...payload, updatedExercise: { ...exercise, exerciseVersion: 2 } as ExerciseSampleRecord }
		expect(selectStartedExercise(stalePayload, { skillId: 'enterInteger' }, context)).toBeUndefined()
		expect(selectExerciseUpdate(stalePayload, { exerciseId: 'exercise-id' }, context)).toBeUndefined()
	})
})
