import { InvalidInputError } from '../../errors.ts'

import type { UserModel, UserRecord } from './models.ts'

export interface UserDatabase {
	User: UserModel
}

export async function getUser(db: UserDatabase, userId: string): Promise<UserRecord> {
	const user = await db.User.findByPk(userId)
	if (!user) throw new InvalidInputError(`Invalid request: unknown user ID "${userId}".`)
	return user
}

export async function getAllUsers(db: UserDatabase): Promise<UserRecord[]> {
	return db.User.findAll()
}
