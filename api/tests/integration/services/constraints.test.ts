import type { SkillId } from '@step-wise/skill-definition'

import { integrationDatabase as db } from '../../support/integrationDatabase.ts'

const ENTER_INTEGER = 'enterInteger' as SkillId

async function createUser(email: string) {
	return db.User.create({ email })
}

describe('database constraints', () => {
	it('rejects duplicate natural keys and memberships', async () => {
		const user = await createUser('unique@example.com')
		const group = await db.Group.create({ code: 'UNIQ' })
		const course = await db.Course.create({ code: 'UNIQUE', name: 'Unique', goals: [], startingPoints: [] })

		await expect(createUser(user.email)).rejects.toMatchObject({ name: 'SequelizeUniqueConstraintError' })
		await expect(db.Group.create({ code: group.code })).rejects.toMatchObject({ name: 'SequelizeUniqueConstraintError' })
		await expect(db.Course.create({ code: course.code, name: 'Duplicate', goals: [], startingPoints: [] })).rejects.toMatchObject({ name: 'SequelizeUniqueConstraintError' })

		await db.GroupMembership.create({ userId: user.id, groupId: group.id })
		await expect(db.GroupMembership.create({ userId: user.id, groupId: group.id })).rejects.toMatchObject({ name: 'SequelizeUniqueConstraintError' })

		await db.UserSkill.create({ userId: user.id, skillId: ENTER_INTEGER })
		await expect(db.UserSkill.create({ userId: user.id, skillId: ENTER_INTEGER })).rejects.toMatchObject({ name: 'SequelizeUniqueConstraintError' })

		await db.CourseSubscription.create({ userId: user.id, courseId: course.id })
		await expect(db.CourseSubscription.create({ userId: user.id, courseId: course.id })).rejects.toMatchObject({ name: 'SequelizeUniqueConstraintError' })
	})

	it('allows only one active solo and group exercise per scope', async () => {
		const user = await createUser('exercise@example.com')
		const skill = await db.UserSkill.create({ userId: user.id, skillId: ENTER_INTEGER })
		await db.ExerciseSample.create({ userSkillId: skill.id, exerciseId: 'first', parameters: {} })
		await expect(db.ExerciseSample.create({ userSkillId: skill.id, exerciseId: 'second', parameters: {} })).rejects.toMatchObject({ name: 'SequelizeUniqueConstraintError' })
		await expect(db.ExerciseSample.create({ userSkillId: skill.id, exerciseId: 'completed', parameters: {}, active: false })).resolves.toBeDefined()

		const group = await db.Group.create({ code: 'EXER' })
		await db.GroupExerciseSample.create({ groupId: group.id, skillId: ENTER_INTEGER, exerciseId: 'first', parameters: {} })
		await expect(db.GroupExerciseSample.create({ groupId: group.id, skillId: ENTER_INTEGER, exerciseId: 'second', parameters: {} })).rejects.toMatchObject({ name: 'SequelizeUniqueConstraintError' })
	})

	it('enforces non-null foreign keys and referential integrity', async () => {
		const unknownId = '00000000-0000-0000-0000-000000000000'
		await expect(db.UserSkill.create({ userId: unknownId, skillId: ENTER_INTEGER })).rejects.toMatchObject({ name: 'SequelizeForeignKeyConstraintError' })
		await expect(db.CourseBlock.create({ courseId: unknownId, name: 'Orphan', goals: [] })).rejects.toMatchObject({ name: 'SequelizeForeignKeyConstraintError' })
		await expect(db.GroupMembership.create({ userId: unknownId, groupId: unknownId })).rejects.toMatchObject({ name: 'SequelizeForeignKeyConstraintError' })
	})

	it('cascades deletion through dependent records', async () => {
		const user = await createUser('cascade@example.com')
		const skill = await db.UserSkill.create({ userId: user.id, skillId: ENTER_INTEGER })
		const exercise = await db.ExerciseSample.create({ userSkillId: skill.id, exerciseId: 'sample', parameters: {} })
		await exercise.createEvent({ action: { type: 'start' }, state: {} })

		await user.destroy()
		expect(await db.UserSkill.count()).toBe(0)
		expect(await db.ExerciseSample.count()).toBe(0)
		expect(await db.ExerciseEvent.count()).toBe(0)
	})
})

describe('transactions', () => {
	it('rolls back all writes when a procedure fails', async () => {
		await expect(db.transaction(async transaction => {
			const user = await db.User.create({ email: 'rollback@example.com' }, { transaction })
			await db.UserSkill.create({ userId: user.id, skillId: ENTER_INTEGER }, { transaction })
			throw new Error('abort')
		})).rejects.toThrow('abort')

		expect(await db.User.count({ where: { email: 'rollback@example.com' } })).toBe(0)
		expect(await db.UserSkill.count()).toBe(0)
	})

	it('commits all writes when a procedure succeeds', async () => {
		await db.transaction(async transaction => {
			const user = await db.User.create({ email: 'commit@example.com' }, { transaction })
			await db.UserSkill.create({ userId: user.id, skillId: ENTER_INTEGER }, { transaction })
		})

		expect(await db.User.count({ where: { email: 'commit@example.com' } })).toBe(1)
		expect(await db.UserSkill.count()).toBe(1)
	})
})
