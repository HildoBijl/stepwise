import type { DocumentNode } from 'graphql'
import type { LOCK, Model, ModelStatic, Sequelize, Transaction } from 'sequelize'

export interface ApiContext {}
export interface ApiLoaders {}
export type LoaderContext = Omit<ApiContext, 'loaders'>
export type ApiModel = ModelStatic<Model> & { associate?: (models: ApiModels) => void }

export interface ServiceOptions {
	transaction?: Transaction
}

export interface LockingServiceOptions extends ServiceOptions {
	lock?: LOCK
}

// API modules augment this registry with the models they contribute.
export interface ApiModels {}

export type ModelFactory<ModelType extends ApiModel = ApiModel> = (sequelize: Sequelize) => ModelType
export type ModelFactories = Partial<{ [Name in keyof ApiModels]: ModelFactory<ApiModels[Name]> }>
export type CompleteModelFactories = { [Name in keyof ApiModels]: ModelFactory<ApiModels[Name]> }
export type LoaderFactory = (context: LoaderContext, loaders: Partial<ApiLoaders>) => Partial<ApiLoaders>

export interface ApiModule {
	models?: ModelFactories
	associate?: (models: ApiModels) => void
	typeDefs?: DocumentNode | DocumentNode[]
	resolvers?: Record<string, unknown>
	createLoaders?: LoaderFactory
}

export function defineApiModule<Module extends ApiModule>(module: Module): Module {
	return module
}

export function defineRegistryKeys<Registry extends object>() {
	return <Keys extends readonly (keyof Registry)[]>(...keys: Keys & ([keyof Registry] extends [Keys[number]] ? unknown : ['Registry key list is incomplete'])): Keys => keys
}

export function ensureCompleteRegistry<Registry extends object>(registry: Partial<Registry>, keys: readonly (keyof Registry)[], name: string): asserts registry is Registry {
	keys.forEach(key => {
		if (!Object.hasOwn(registry, key) || registry[key] === undefined) throw new Error(`Missing ${name} registration for "${String(key)}".`)
	})
}
