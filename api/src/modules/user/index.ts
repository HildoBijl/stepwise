import { defineApiModule } from '../types.js'

import { userTypeDefs } from './schema.js'
import { createUserModel } from './model.js'
import { createUserResolvers, type UserPrivateAccessRule } from './resolvers.js'

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

export * from './model.js'
export * from './service.js'
export * from './resolvers.js'
