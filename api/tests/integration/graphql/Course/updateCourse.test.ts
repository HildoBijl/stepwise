import surfConextMockData from '../../../../src/modules/authentication/surfConext/mockData.json' with { type: 'json' }

import { createClient } from '../../../support/client.ts'

const TEACHER_ID = '22222222-2222-2222-2222-222222222222'
const TEACHER_SURFSUB = '2222222222222222222222222222222222222222'
const TEACHER = surfConextMockData.find(surf => surf.sub === TEACHER_SURFSUB)!
const COURSE_ID = '00000000-0000-0000-0000-000000000001'
const STARTING_POINT_ID = 'demo'
const LEARNING_GOAL_ID = 'test'

async function seed(db) {
	const teacher = await db.User.create({ id: TEACHER_ID, name: TEACHER.name, email: TEACHER.email, role: 'teacher' })
	await teacher.createSurfConextProfile({ id: TEACHER_SURFSUB })
	const course = await db.Course.create({
		id: COURSE_ID,
		code: 'TEST',
		name: 'Test course',
		description: 'Description',
		goals: [LEARNING_GOAL_ID],
		goalWeights: [2],
		startingPoints: [STARTING_POINT_ID],
		setup: null,
	})
	await db.CourseSubscription.create({ courseId: course.id, userId: teacher.id, role: 'teacher' })
	await course.createBlock({ name: 'Block', goals: [LEARNING_GOAL_ID] })
}

describe('updateCourse', () => {
	it('distinguishes omitted fields from fields explicitly set to null', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(TEACHER_SURFSUB)

		const response = await client.graphql({
			query: `mutation {
				updateCourse(courseId: "${COURSE_ID}", input: {description: null, goalWeights: null, setup: null, blocks: null}) {
					name description goalWeights setup blocks {name}
				}
			}`,
		})
		expect(response.errors).toBeUndefined()
		expect(response.data.updateCourse).toStrictEqual({ name: 'Test course', description: null, goalWeights: null, setup: null, blocks: [] })
	})

	it('rejects null for a non-nullable stored field', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(TEACHER_SURFSUB)

		const { data, errors } = await client.graphql({ query: `mutation {updateCourse(courseId: "${COURSE_ID}", input: {name: null}) {name}}` })
		expect(data).toStrictEqual(null)
		expect(errors[0].extensions).toStrictEqual({ code: 'BAD_USER_INPUT' })
	})
})
