import { defineApiModule } from '../types.ts'

import { userTypeDefs } from './schema.ts'
import { type UserModel, createUserModel } from './models.ts'
import { type UserSharedDataAccessRule, createUserResolvers } from './resolvers.ts'

declare module '../types.ts' {
	interface ApiModels {
		User: UserModel
	}
}

interface UserModuleOptions {
	sharedDataAccessRules?: UserSharedDataAccessRule[]
}

export function createUserModule({ sharedDataAccessRules = [] }: UserModuleOptions = {}) {
	return defineApiModule({
		typeDefs: userTypeDefs,
		models: { User: createUserModel },
		resolvers: createUserResolvers(sharedDataAccessRules),
	})
}

export * from './models.ts'
export * from './service.ts'
export * from './resolvers.ts'
export * from './context.ts'
