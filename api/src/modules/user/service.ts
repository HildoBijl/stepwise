import { UserInputError } from 'apollo-server-express'

import type { UserModel, UserRecord } from './model'

export interface UserDatabase {
	User: UserModel
}

export const getUser = async (database: UserDatabase, userId: string): Promise<UserRecord> => {
	const user = await database.User.findByPk(userId)
	if (!user) throw new UserInputError(`Invalid request: unknown user ID "${userId}".`)
	return user
}

export const getAllUsers = async (database: UserDatabase): Promise<UserRecord[]> => database.User.findAll()
