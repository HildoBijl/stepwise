import type { DocumentNode } from 'graphql'
import type { Model, ModelStatic, Sequelize } from 'sequelize'

export type ApiContext = Record<string, any>
export type ApiLoaders = Record<string, any>
export type ApiModel = ModelStatic<Model> & { associate?: (models: ApiModels) => void }
export type ApiModels = Record<string, ApiModel>
export type ModelFactory = (sequelize: Sequelize) => ApiModel
export type LoaderFactory = (context: ApiContext, loaders: ApiLoaders) => ApiLoaders

export interface ApiModule {
	models?: Record<string, ModelFactory>
	associate?: (models: ApiModels) => void
	typeDefs?: DocumentNode | DocumentNode[]
	resolvers?: Record<string, any>
	createLoaders?: LoaderFactory
}

export const defineApiModule = <Module extends ApiModule>(module: Module): Module => module
