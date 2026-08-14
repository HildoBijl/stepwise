import { defineApiModule } from '../types'

import { userTypeDefs } from './schema'
import { createUserModel } from './model'
import { createUserResolvers, type UserPrivateAccessRule } from './resolvers'

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

export * from './model'
export * from './service'
export * from './resolvers'
