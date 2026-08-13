import type { Sequelize, Transaction } from 'sequelize'

import legacyModels from './models'
import { type ApiModels, initializeModels, composeModels, apiModules } from '../modules'

const modelFactories = composeModels(legacyModels, apiModules)

export class Database {
	[key: string]: any

	private readonly sequelize: Sequelize

	constructor(sequelize: Sequelize) {
		this.sequelize = sequelize
		Object.assign(this, initializeModels(sequelize, modelFactories, apiModules))
	}

	async transaction<T>(procedure: (transaction: Transaction) => PromiseLike<T>): Promise<T> {
		return this.sequelize.transaction<T>(procedure)
	}
}

export type { ApiModels }
