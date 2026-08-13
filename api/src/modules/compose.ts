import type { DocumentNode } from 'graphql'
import type { Sequelize } from 'sequelize'

import type { ApiContext, ApiLoaders, ApiModel, ApiModels, ApiModule, LoaderFactory, ModelFactory } from './types'

export const composeTypeDefs = (legacyTypeDefs: DocumentNode[], modules: ApiModule[]): DocumentNode[] => [
	...legacyTypeDefs,
	...modules.flatMap(module => module.typeDefs ? [module.typeDefs].flat() : []),
]

export const composeResolvers = (legacyResolvers: Record<string, any>[], modules: ApiModule[]): Record<string, any>[] => [
	...legacyResolvers,
	...modules.flatMap(module => module.resolvers ? [module.resolvers] : []),
]

export const composeLoaders = (legacyCreateLoaders: LoaderFactory, modules: ApiModule[]): LoaderFactory =>
	(context: ApiContext): ApiLoaders => {
		let loaders = legacyCreateLoaders(context, {})
		modules.forEach(module => {
			if (module.createLoaders) loaders = { ...loaders, ...module.createLoaders(context, loaders) }
		})
		return loaders
	}

export const composeModels = (legacyModels: Record<string, ModelFactory>, modules: ApiModule[]): Record<string, ModelFactory> => ({
	...legacyModels,
	...Object.assign({}, ...modules.map(module => module.models ?? {})),
})

export const initializeModels = (sequelize: Sequelize, modelFactories: Record<string, ModelFactory>, modules: ApiModule[]): ApiModels => {
	const models = Object.fromEntries(Object.entries(modelFactories).map(([name, factory]) => [name, factory(sequelize)])) as ApiModels
	Object.values(models).forEach((model: ApiModel) => model.associate?.(models))
	modules.forEach(module => module.associate?.(models))
	return models
}
