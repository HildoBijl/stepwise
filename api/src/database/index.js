const models = require('./models')

class Database {
	constructor(sequelize) {
		this._sequelize = sequelize

		// Import all the models.
		Object.keys(models).forEach(key => {
			this[key] = models[key](sequelize)
		})

		// Make associations.
		Object.keys(models).forEach(key => {
			if (this[key].associate)
				this[key].associate(this)
		})
	}

	async transaction(procedure) {
		return await this._sequelize.transaction(procedure)
	}
}

module.exports = { Database }
