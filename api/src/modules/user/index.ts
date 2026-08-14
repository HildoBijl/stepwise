import { defineApiModule } from '../types.ts'

import { userTypeDefs } from './schema.ts'
import { createUserModel } from './model.ts'
import { createUserResolvers, type UserPrivateAccessRule } from './resolvers.ts'

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

export * from './model.ts'
export * from './service.ts'
export * from './resolvers.ts'
