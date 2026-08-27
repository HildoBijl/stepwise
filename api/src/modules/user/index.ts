import { defineApiModule } from '../types.ts'

import { userTypeDefs } from './schema.ts'
import { type UserModel, createUserModel } from './models.ts'
import { type UserPrivateAccessRule, createUserResolvers } from './resolvers.ts'

declare module '../types.ts' {
	interface ApiModels {
		User: UserModel
	}
}

interface UserModuleOptions {
	privateAccessRules?: UserPrivateAccessRule[]
}

export function createUserModule({ privateAccessRules = [] }: UserModuleOptions = {}) {
	return defineApiModule({
		typeDefs: userTypeDefs,
		models: { User: createUserModel },
		resolvers: createUserResolvers(privateAccessRules),
	})
}

export * from './models.ts'
export * from './service.ts'
export * from './resolvers.ts'
export * from './context.ts'
