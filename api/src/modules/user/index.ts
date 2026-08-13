import { defineApiModule } from '../types'
import { createUserModel } from './model'
import { userResolvers } from './resolvers'
import { userTypeDefs } from './schema'

export const userModule = defineApiModule({
	models: { User: createUserModel },
	typeDefs: userTypeDefs,
	resolvers: userResolvers,
})

export * from './model'
export * from './service'
