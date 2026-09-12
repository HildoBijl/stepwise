import { describe, expect, it } from 'vitest'

import { type UserSkillRecord, createSkillResolverSource } from '../../../../src/modules/skill/index.ts'
import type { ExerciseSampleRecord } from '../../../../src/modules/exercise/models.ts'
import type { ExerciseUpdatedPayload } from '../../../../src/modules/exercise/service.ts'
import { exerciseResolvers, selectExerciseUpdate, selectStartedExercise } from '../../../../src/modules/exercise/resolvers.ts'

describe('exercise resolvers', () => {
	it('only exposes exercise data when the skill grants access', () => {
		const skill = {} as UserSkillRecord

		expect(exerciseResolvers.Skill.exerciseData(createSkillResolverSource(skill, false))).toBeNull()
		expect(exerciseResolvers.Skill.exerciseData(createSkillResolverSource(skill, true))).toBe(skill)
	})
})

const exercise = { id: 'exercise-id' } as ExerciseSampleRecord
const payload: ExerciseUpdatedPayload = { updatedExercise: exercise, userId: 'user-id', skillId: 'enterInteger', action: 'submitAction' }
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
})
