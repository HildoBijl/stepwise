import { UserInputError } from 'apollo-server-express'

import type { UserModel, UserRecord } from './model.js'

export interface UserDatabase {
	User: UserModel
}

export async function getUser(database: UserDatabase, userId: string): Promise<UserRecord> {
	const user = await database.User.findByPk(userId)
	if (!user) throw new UserInputError(`Invalid request: unknown user ID "${userId}".`)
	return user
}

export async function getAllUsers(database: UserDatabase): Promise<UserRecord[]> {
	return database.User.findAll()
}
