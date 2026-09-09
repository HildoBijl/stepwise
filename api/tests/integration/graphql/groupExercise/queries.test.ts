import { describe, expect, it } from 'vitest'

import { getExercises } from '@step-wise/exercises'

import surfConextMockData from '../../../../src/modules/authentication/surfConext/mockData.json' with { type: 'json' }

import { createClient } from '../../../support/client.ts'

const ALEX_ID = 'a0000000-0000-0000-0000-000000000000'
const ALEX_SURFSUB = 'a000000000000000000000000000000000000000'
const ALEX = surfConextMockData.find(profile => profile.sub === ALEX_SURFSUB)!
const BOB_ID = 'b0000000-0000-0000-0000-000000000000'
const BOB_SURFSUB = 'b000000000000000000000000000000000000000'
const BOB = surfConextMockData.find(profile => profile.sub === BOB_SURFSUB)!

const OLD_EXERCISE_ID = '10000000-0000-0000-0000-000000000000'
const NEW_EXERCISE_ID = '20000000-0000-0000-0000-000000000000'
const MISSING_EXERCISE_ID = '30000000-0000-0000-0000-000000000000'
const SAMPLE_SKILL = 'enterInteger'
const GROUP_CODE = 'PHYS'

async function seed(db) {
	const alex = await db.User.create({ id: ALEX_ID, name: ALEX.name, email: ALEX.email })
	await alex.createSurfConextProfile({ id: ALEX_SURFSUB })
	const bob = await db.User.create({ id: BOB_ID, name: BOB.name, email: BOB.email })
	await bob.createSurfConextProfile({ id: BOB_SURFSUB })
	const group = await db.Group.create({ code: GROUP_CODE })
	await group.addMember(alex.id)

	const definitions = getExercises(SAMPLE_SKILL)
	const exerciseId = definitions && Object.keys(definitions)[0]
	if (!exerciseId) throw new Error(`No exercise definition is available for skill "${SAMPLE_SKILL}".`)
	await db.GroupExerciseSample.create({
		id: OLD_EXERCISE_ID,
		groupId: group.id,
		skillId: SAMPLE_SKILL,
		exerciseId,
		parameters: {},
		initialState: {},
		active: false,
		createdAt: new Date('2026-01-01T00:00:00.000Z'),
		updatedAt: new Date('2026-01-01T00:00:00.000Z'),
	})
	await db.GroupExerciseSample.create({
		id: NEW_EXERCISE_ID,
		groupId: group.id,
		skillId: SAMPLE_SKILL,
		exerciseId,
		parameters: {},
		initialState: {},
		active: false,
		createdAt: new Date('2026-01-02T00:00:00.000Z'),
		updatedAt: new Date('2026-01-02T00:00:00.000Z'),
	})
}

describe('group exercise queries', () => {
	it('returns the latest exercise for a group and skill even when it is completed', async () => {
		const client = await createClient(seed)
		await client.signInWithSurfConext(ALEX_SURFSUB)

		const { data, errors } = await client.graphql({ query: `{latestGroupExercise(code: "${GROUP_CODE.toLowerCase()}", skillId: "${SAMPLE_SKILL}") {id active}}` })
		expect(errors).toBeUndefined()
		expect(data.latestGroupExercise).toStrictEqual({ id: NEW_EXERCISE_ID, active: false })
	})

	it('returns a specific older exercise by ID', async () => {
		const client = await createClient(seed)
		await client.signInWithSurfConext(ALEX_SURFSUB)

		const { data, errors } = await client.graphql({ query: `{groupExercise(id: "${OLD_EXERCISE_ID}") {id skillId active history {id}}}` })
		expect(errors).toBeUndefined()
		expect(data.groupExercise).toStrictEqual({ id: OLD_EXERCISE_ID, skillId: SAMPLE_SKILL, active: false, history: [] })
	})

	it('returns null when an exercise does not exist', async () => {
		const client = await createClient(seed)
		await client.signInWithSurfConext(ALEX_SURFSUB)

		const { data, errors } = await client.graphql({ query: `{groupExercise(id: "${MISSING_EXERCISE_ID}") {id}}` })
		expect(errors).toBeUndefined()
		expect(data.groupExercise).toBe(null)
	})

	it('denies both queries to users outside the group', async () => {
		const client = await createClient(seed)
		await client.signInWithSurfConext(BOB_SURFSUB)

		const latestResult = await client.graphql({ query: `{latestGroupExercise(code: "${GROUP_CODE}", skillId: "${SAMPLE_SKILL}") {id}}` })
		const exerciseResult = await client.graphql({ query: `{groupExercise(id: "${OLD_EXERCISE_ID}") {id}}` })
		expect(latestResult.data).toStrictEqual({ latestGroupExercise: null })
		expect(latestResult.errors[0].extensions).toStrictEqual({ code: 'FORBIDDEN' })
		expect(exerciseResult.data).toStrictEqual({ groupExercise: null })
		expect(exerciseResult.errors[0].extensions).toStrictEqual({ code: 'FORBIDDEN' })
	})
})
