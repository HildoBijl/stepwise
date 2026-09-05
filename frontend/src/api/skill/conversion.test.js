import { describe, expect, it } from 'vitest'

import { skillRecordToSkill, userWithSkillsRecordToUser } from './conversion'

describe('skill API conversion', () => {
	it('flattens exercise data into a skill', () => {
		const exerciseData = { exercises: [{ id: 'exercise-id' }], activeExercise: { id: 'exercise-id' } }

		expect(skillRecordToSkill({ id: 'skill-id', skillId: 'enterInteger', exerciseData })).toEqual({
			id: 'skill-id',
			skillId: 'enterInteger',
			...exerciseData,
		})
	})

	it('does not expose the transport-only exerciseData property when access is denied', () => {
		expect(skillRecordToSkill({ id: 'skill-id', skillId: 'enterInteger', exerciseData: null })).toEqual({ id: 'skill-id', skillId: 'enterInteger' })
	})

	it('flattens user access data and converts its skills', () => {
		const user = userWithSkillsRecordToUser({
			id: 'user-id',
			name: 'Alex',
			sharedData: { email: 'alex@example.com', skills: [{ id: 'skill-id', exerciseData: { exercises: [], activeExercise: null } }] },
			accountData: { role: 'admin' },
		})

		expect(user).toEqual({ id: 'user-id', name: 'Alex', email: 'alex@example.com', role: 'admin', skills: [{ id: 'skill-id', exercises: [], activeExercise: null }] })
	})
})
