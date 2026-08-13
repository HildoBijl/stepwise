import type { Sequelize, Transaction } from 'sequelize'

import { type ApiModel, type ApiModels, type ModelFactory, apiModules } from '../modules'

const modelFactories: Record<string, ModelFactory> = Object.assign({}, ...apiModules.map(module => module.models ?? {}))

function initializeModels(sequelize: Sequelize): ApiModels {
	const models = Object.fromEntries(Object.entries(modelFactories).map(([name, factory]) => [name, factory(sequelize)])) as ApiModels
	Object.values(models).forEach((model: ApiModel) => model.associate?.(models))
	apiModules.forEach(module => module.associate?.(models))
	return models
}

export class Database {
	[key: string]: any

	private readonly sequelize: Sequelize

	constructor(sequelize: Sequelize) {
		this.sequelize = sequelize
		Object.assign(this, initializeModels(sequelize))
	}

	async transaction<T>(procedure: (transaction: Transaction) => PromiseLike<T>): Promise<T> {
		return this.sequelize.transaction<T>(procedure)
	}
}
