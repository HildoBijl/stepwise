import { Op } from 'sequelize'

import { InvalidInputError } from '../../errors.ts'

import type { UserModel, UserRecord } from './models.ts'

export interface UserDatabase { User: UserModel }

export const USER_ACTIVITY_UPDATE_INTERVAL_MILLISECONDS = 30 * 60 * 1000

interface RecordUserActivityOptions { now?: Date }

export async function recordUserActivity(db: UserDatabase, user: UserRecord, { now = new Date() }: RecordUserActivityOptions = {}): Promise<void> {
	const updateBefore = new Date(now.getTime() - USER_ACTIVITY_UPDATE_INTERVAL_MILLISECONDS)
	if (user.lastActiveAt && user.lastActiveAt >= updateBefore) return
	const [updatedRows] = await db.User.update({ lastActiveAt: now }, {
		where: {
			id: user.id,
			[Op.or]: [{ lastActiveAt: null }, { lastActiveAt: { [Op.lt]: updateBefore } }],
		},
	})
	if (updatedRows > 0) user.lastActiveAt = now
}

export async function getUser(db: UserDatabase, userId: string): Promise<UserRecord> {
	const user = await db.User.findByPk(userId)
	if (!user) throw new InvalidInputError(`Invalid request: unknown user ID "${userId}".`)
	return user
}

export async function getAllUsers(db: UserDatabase): Promise<UserRecord[]> {
	return db.User.findAll()
}
