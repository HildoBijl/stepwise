import { DateTimeResolver, EmailAddressResolver, JSONResolver } from 'graphql-scalars'
import type { IResolvers } from '@graphql-tools/utils'

import { apiModules } from '../modules/index.ts'

const scalarResolvers = {
	EmailAddress: EmailAddressResolver,
	DateTime: DateTimeResolver,
	JSON: JSONResolver,
}

export const resolvers = [scalarResolvers, ...apiModules.flatMap(module => module.resolvers ? [module.resolvers as IResolvers] : [])]
