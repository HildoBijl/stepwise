import legacyCreateLoaders from './loaders'
import legacyResolvers from './resolvers'
import legacyTypeDefs from './schemas'
import { apiModules, composeLoaders, composeResolvers, composeTypeDefs } from '../modules'

export const typeDefs = composeTypeDefs(legacyTypeDefs, apiModules)
export const resolvers = composeResolvers(legacyResolvers, apiModules)
export const createLoaders = composeLoaders(legacyCreateLoaders, apiModules)
