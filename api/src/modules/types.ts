import type { DocumentNode } from 'graphql'
import type { Model, ModelStatic, Sequelize } from 'sequelize'

export interface ApiContext {}
export type ApiLoaders = Record<string, any>
export type ApiModel = ModelStatic<Model> & { associate?: (models: ApiModels) => void }

// API modules augment this registry with the models they contribute.
export interface ApiModels {}

export type ModelFactory<ModelType extends ApiModel = ApiModel> = (sequelize: Sequelize) => ModelType
export type ModelFactories = Partial<{ [Name in keyof ApiModels]: ModelFactory<ApiModels[Name]> }>
export type LoaderFactory = (context: ApiContext, loaders: ApiLoaders) => ApiLoaders

export interface ApiModule {
	models?: ModelFactories
	associate?: (models: ApiModels) => void
	typeDefs?: DocumentNode | DocumentNode[]
	resolvers?: Record<string, any>
	createLoaders?: LoaderFactory
}

export function defineApiModule<Module extends ApiModule>(module: Module): Module {
	return module
}
