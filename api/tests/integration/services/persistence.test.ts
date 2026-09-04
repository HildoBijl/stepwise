import { describe, expect, it } from 'vitest'

import type { SkillId } from '@step-wise/skill-definition'

import { getCourseByCode, getCourses } from '../../../src/modules/course/index.ts'
import { getUserSkillWithExercises } from '../../../src/modules/exercise/index.ts'
import { deactivateUserGroupMemberships, getGroup, getUserWithGroups } from '../../../src/modules/group/index.ts'
import { getUserSkills } from '../../../src/modules/skill/index.ts'
import { getAllUsers, getUser } from '../../../src/modules/user/index.ts'

import { integrationDatabase as db } from '../../support/integrationDatabase.ts'

const ENTER_INTEGER = 'enterInteger' as SkillId
const ADD_INTEGER = 'addInteger' as SkillId

async function createUser(email: string) {
	return db.User.create({ email })
}

describe('user services', () => {
	it('loads users and rejects an unknown ID', async () => {
		const first = await createUser('first@example.com')
		const second = await createUser('second@example.com')

		await expect(getUser(db, first.id)).resolves.toMatchObject({ email: first.email })
		await expect(getAllUsers(db)).resolves.toEqual(expect.arrayContaining([
			expect.objectContaining({ id: first.id }),
			expect.objectContaining({ id: second.id }),
		]))
		await expect(getUser(db, '00000000-0000-0000-0000-000000000000')).rejects.toMatchObject({
			extensions: { code: 'BAD_USER_INPUT' },
		})
	})
})

describe('skill and exercise services', () => {
	it('filters skills and creates a missing skill only when requested', async () => {
		const user = await createUser('student@example.com')
		await db.UserSkill.create({ userId: user.id, skillId: ENTER_INTEGER })
		await db.UserSkill.create({ userId: user.id, skillId: ADD_INTEGER })

		const filtered = await getUserSkills(db, user.id, { skillIds: [ENTER_INTEGER] })
		expect(filtered.map(skill => skill.skillId)).toStrictEqual([ENTER_INTEGER])

		const absentUser = await createUser('new-student@example.com')
		await expect(getUserSkillWithExercises(db, absentUser.id, ENTER_INTEGER)).resolves.toBeNull()
		const created = await getUserSkillWithExercises(db, absentUser.id, ENTER_INTEGER, { createIfNoneExists: true })
		expect(created).toMatchObject({ skill: { userId: absentUser.id, skillId: ENTER_INTEGER }, exercises: [], activeExercise: undefined })
	})

	it('loads exercises in creation order and identifies the active exercise', async () => {
		const user = await createUser('exerciser@example.com')
		const skill = await db.UserSkill.create({ userId: user.id, skillId: ENTER_INTEGER })
		const completed = await db.ExerciseSample.create({ userSkillId: skill.id, exerciseId: 'enterInteger', parameters: { x: 1 }, active: false })
		const active = await db.ExerciseSample.create({ userSkillId: skill.id, exerciseId: 'enterInteger', parameters: { x: 2 } })
		await completed.createEvent({ action: { type: 'start' }, state: { attempted: true } })

		const result = await getUserSkillWithExercises(db, user.id, ENTER_INTEGER, { includeExercises: true, requireActiveExercise: true })
		expect(result?.exercises.map(exercise => exercise.id)).toStrictEqual([completed.id, active.id])
		expect(result?.activeExercise?.id).toBe(active.id)
	})
})

describe('group services', () => {
	it('normalizes codes, loads members, and filters active memberships', async () => {
		const user = await createUser('member@example.com')
		const inactiveGroup = await db.Group.create({ code: 'MATH' })
		const activeGroup = await db.Group.create({ code: 'PHYS' })
		await inactiveGroup.addMember(user.id)
		await activeGroup.addMember(user.id)
		await db.GroupMembership.update({ active: true }, { where: { userId: user.id, groupId: activeGroup.id } })

		const loaded = await getGroup(db, 'phys', { includeMembers: true })
		expect(loaded.members.map(member => member.id)).toStrictEqual([user.id])

		const userWithGroups = await getUserWithGroups(db, user.id, { onlyActive: true })
		expect(userWithGroups.groups.map(group => group.code)).toStrictEqual(['PHYS'])
	})

	it('deactivates memberships except for the requested group', async () => {
		const user = await createUser('active-member@example.com')
		const preserved = await db.Group.create({ code: 'KEEP' })
		const deactivated = await db.Group.create({ code: 'DROP' })
		await preserved.addMember(user.id, { through: { active: true } })
		await deactivated.addMember(user.id, { through: { active: true } })

		const loadedUser = await getUserWithGroups(db, user.id)
		const changed = await deactivateUserGroupMemberships(loadedUser, { exceptionCode: 'keep' })
		expect(changed.map(group => group.code)).toStrictEqual(['DROP'])
		expect((await db.GroupMembership.findOne({ where: { userId: user.id, groupId: preserved.id } }))?.active).toBe(true)
		expect((await db.GroupMembership.findOne({ where: { userId: user.id, groupId: deactivated.id } }))?.active).toBe(false)
	})
})

describe('course services', () => {
	it('orders blocks and exposes only the requested user subscription', async () => {
		const participant = await createUser('participant@example.com')
		const otherUser = await createUser('other@example.com')
		const course = await db.Course.create({ code: 'COURSE', name: 'Course', goals: [ENTER_INTEGER], startingPoints: [] })
		await course.createBlock({ index: 2, name: 'Second', goals: [] })
		await course.createBlock({ index: 1, name: 'First', goals: [] })
		await db.CourseSubscription.create({ userId: participant.id, courseId: course.id, role: 'teacher' })

		const loaded = await getCourseByCode(db, course.code, { userId: participant.id })
		expect(loaded.blocks?.map(block => block.name)).toStrictEqual(['First', 'Second'])
		expect(loaded.courseSubscription?.role).toBe('teacher')

		const withoutSubscription = await getCourseByCode(db, course.code, { userId: otherUser.id })
		expect(withoutSubscription.courseSubscription).toBeUndefined()
	})

	it('filters to courses belonging to the requested user', async () => {
		const user = await createUser('course-student@example.com')
		const own = await db.Course.create({ code: 'OWN', name: 'Own', goals: [], startingPoints: [] })
		await db.Course.create({ code: 'OTHER', name: 'Other', goals: [], startingPoints: [] })
		await db.CourseSubscription.create({ userId: user.id, courseId: own.id })

		const courses = await getCourses(db, { userId: user.id, onlyOwnCourses: true })
		expect(courses.map(course => course.code)).toStrictEqual(['OWN'])
		expect(courses[0]?.courseSubscription).toMatchObject({ userId: user.id, courseId: own.id })
	})
})
