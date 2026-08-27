import type { Sequelize, Transaction } from 'sequelize'

import { type ApiModel, type ApiModels, type ModelFactory, apiModules } from './modules/index.ts'

const modelFactories: Record<string, ModelFactory> = Object.assign({}, ...apiModules.map(module => module.models ?? {}))

function initializeModels(sequelize: Sequelize): ApiModels {
	const models: Partial<ApiModels> = {}
	Object.entries(modelFactories).forEach(([name, factory]) => Object.assign(models, { [name]: factory(sequelize) }))
	const initializedModels = models as ApiModels
	Object.values(initializedModels).forEach((model: ApiModel) => model.associate?.(initializedModels))
	apiModules.forEach(module => module.associate?.(initializedModels))
	return initializedModels
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
