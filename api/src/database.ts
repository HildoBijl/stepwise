import type { Sequelize, Transaction } from 'sequelize'

import { type ApiModel, type ApiModels, type CompleteModelFactories, type ModelFactories, apiModules, defineRegistryKeys, ensureCompleteRegistry } from './modules/index.ts'

const modelNames = defineRegistryKeys<ApiModels>()(
	'User',
	'SurfConextProfile',
	'Course',
	'CourseSubscription',
	'CourseBlock',
	'UserSkill',
	'ExerciseSample',
	'ExerciseEvent',
	'Group',
	'GroupMembership',
	'GroupExerciseSample',
	'GroupExerciseEvent',
	'GroupExerciseAction',
)

function collectModelFactories(): CompleteModelFactories {
	const factories: ModelFactories = {}
	apiModules.forEach(module => {
		Object.entries(module.models ?? {}).forEach(([name, factory]) => {
			if (Object.hasOwn(factories, name)) throw new Error(`Duplicate model registration for "${name}".`)
			Object.assign(factories, { [name]: factory })
		})
	})
	ensureCompleteRegistry(factories, modelNames, 'model')
	return factories
}

const modelFactories = collectModelFactories()

function initializeModels(sequelize: Sequelize): ApiModels {
	const models: Partial<ApiModels> = {}
	Object.entries(modelFactories).forEach(([name, factory]) => Object.assign(models, { [name]: factory(sequelize) }))
	ensureCompleteRegistry(models, modelNames, 'initialized model')
	Object.values(models).forEach((model: ApiModel) => model.associate?.(models))
	apiModules.forEach(module => module.associate?.(models))
	return models
}

export interface Database extends ApiModels {}

export class Database {
	private readonly sequelize: Sequelize

	constructor(sequelize: Sequelize) {
		this.sequelize = sequelize
		Object.assign(this, initializeModels(sequelize))
	}

	async transaction<T>(procedure: (transaction: Transaction) => PromiseLike<T>): Promise<T> {
		return this.sequelize.transaction<T>(procedure)
	}
}
