import { describe, expect, it } from 'vitest'

import type { ExerciseRecord, SkillRecord } from './records.ts'
import { skillRecordToSkill, userWithSkillsRecordToUser } from './conversion.ts'

const date = '2026-01-02T03:04:05.000Z'

function createExerciseRecord(): ExerciseRecord {
	return {
		id: 'exercise-id',
		exerciseId: 'integerInput',
		mode: 'solo',
		parameters: {},
		initialState: {},
		startedAt: date,
		active: true,
		state: {},
		history: [],
	}
}

function createSkillRecord(options: Partial<SkillRecord> = {}): SkillRecord {
	return {
		id: 'skill-id',
		userId: 'user-id',
		skillId: 'enterInteger',
		levelData: {
			numPracticed: 0,
			coefficients: [1],
			coefficientsOn: date,
			highest: [1],
			highestOn: date,
		},
		...options,
	}
}

describe('skill API conversion', () => {
	it('flattens and converts exercise data', () => {
		const exercise = createExerciseRecord()
		const skill = skillRecordToSkill(createSkillRecord({ exerciseData: { exercises: [exercise], activeExercise: exercise } }))

		expect(skill.exercises?.[0]?.startedAt).toStrictEqual(new Date(date))
		expect(skill.activeExercise?.startedAt).toStrictEqual(new Date(date))
		expect(skill).not.toHaveProperty('coefficients')
		expect(skill).not.toHaveProperty('levelData')
	})

	it('does not expose the transport-only exerciseData property when access is denied', () => {
		const skill = skillRecordToSkill(createSkillRecord({ exerciseData: null }))
		expect(skill).not.toHaveProperty('exerciseData')
		expect(skill).not.toHaveProperty('exercises')
	})

	it('omits activeExercise when exercise data is loaded but no exercise is active', () => {
		const skill = skillRecordToSkill(createSkillRecord({ exerciseData: { exercises: [], activeExercise: null } }))
		expect(skill.exercises).toStrictEqual([])
		expect(skill).not.toHaveProperty('activeExercise')
	})

	it('flattens user access data and converts its skills', () => {
		const user = userWithSkillsRecordToUser({
			id: 'user-id',
			name: 'Alex',
			givenName: 'Alex',
			familyName: null,
			sharedData: { email: 'alex@example.com', skills: [createSkillRecord({ exerciseData: { exercises: [], activeExercise: null } })] },
			accountData: {
				role: 'admin',
				language: null,
				privacyPolicyConsent: { version: null, acceptedAt: null, isLatestVersion: false },
				createdAt: date,
				updatedAt: date,
			},
		})

		expect(user).toMatchObject({ id: 'user-id', name: 'Alex', email: 'alex@example.com', role: 'admin' })
		expect(user.skills[0]?.exercises).toStrictEqual([])
		expect(user.skillLevelSet.getSkillLevel('enterInteger').coefficientsOn).toStrictEqual(new Date(date))
	})
})
