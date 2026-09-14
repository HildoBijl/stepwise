import { describe, expect, it } from 'vitest'

import type { ExerciseRecord, SkillWithExerciseHistoryRecord, SkillWithLatestExerciseRecord } from './records.ts'
import { exerciseRecordToExercise, skillWithLatestExerciseRecordToSkill, userWithSkillsRecordToUser } from './conversion.ts'

const date = '2026-01-02T03:04:05.000Z'

function createExerciseRecord(): ExerciseRecord {
	return {
		id: 'exercise-id',
		eventIndex: 2,
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

function createSkillLevelRecord() {
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
	}
}

function createLatestExerciseSkillRecord(exerciseData: SkillWithLatestExerciseRecord['exerciseData']): SkillWithLatestExerciseRecord {
	return {
		id: 'skill-id',
		userId: 'user-id',
		skillId: 'enterInteger',
		exerciseData,
	}
}

function createExerciseHistorySkillRecord(exerciseData: SkillWithExerciseHistoryRecord['exerciseData']): SkillWithExerciseHistoryRecord {
	return {
		...createSkillLevelRecord(),
		exerciseData,
	}
}

describe('skill API conversion', () => {
	it('flattens and converts exercise data', () => {
		const exercise = createExerciseRecord()
		const skill = skillWithLatestExerciseRecordToSkill(createLatestExerciseSkillRecord({ latestExercise: exercise }))

		expect(skill.latestExercise?.startedAt).toStrictEqual(new Date(date))
		expect(skill.latestExercise?.eventIndex).toBe(2)
		expect(skill).not.toHaveProperty('coefficients')
		expect(skill).not.toHaveProperty('levelData')
	})

	it('does not expose the transport-only exerciseData property when access is denied', () => {
		const skill = skillWithLatestExerciseRecordToSkill(createLatestExerciseSkillRecord(null))
		expect(skill).not.toHaveProperty('exerciseData')
	})

	it('omits latestExercise when exercise data is loaded but no exercise exists', () => {
		const skill = skillWithLatestExerciseRecordToSkill(createLatestExerciseSkillRecord({ latestExercise: null }))
		expect(skill).not.toHaveProperty('latestExercise')
	})

	it('flattens user access data and converts its skills', () => {
		const user = userWithSkillsRecordToUser({
			id: 'user-id',
			name: 'Alex',
			givenName: 'Alex',
			familyName: null,
			sharedData: { email: 'alex@example.com', skills: [createExerciseHistorySkillRecord({ exercises: [] })] },
			accountData: {
				role: 'admin',
				language: null,
				privacyPolicyConsent: { version: null, acceptedAt: null, isLatestVersion: false },
				createdAt: date,
				updatedAt: date,
				lastActiveAt: date,
			},
		})

		expect(user).toMatchObject({ id: 'user-id', name: 'Alex', email: 'alex@example.com', role: 'admin' })
		expect(user.skills[0]?.exercises).toStrictEqual([])
		expect(user.skillLevelSet.getSkillLevel('enterInteger').coefficientsOn).toStrictEqual(new Date(date))
	})

	it('omits null reports and preserves stored reports', () => {
		const event = { id: 'event-id', eventIndex: 0, action: { type: 'input' }, state: {}, report: null, performedAt: date }
		const withoutReport = exerciseRecordToExercise({ ...createExerciseRecord(), history: [event] })
		const withReport = exerciseRecordToExercise({ ...createExerciseRecord(), history: [{ ...event, report: { correct: false } }] })

		expect('report' in withoutReport.history[0]!).toBe(false)
		expect(withReport.history[0]?.report).toEqual({ correct: false })
	})
})
