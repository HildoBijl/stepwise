const { DataSource } = require('apollo-datasource')
const { DataTypes } = require('sequelize')

class Database extends DataSource {
	constructor(sequelizeInstance) {
		super()
		this._sequelize = sequelizeInstance
		this.Exercise = this._sequelize.define('Exercise', {
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			}
		})
	}

	async dangerouslySyncDatabaseSchema() {
		// TODO Don’t use syncing in production, because it might erase entire tables.
		// Introduce proper migrations at some point!
		// See https://sequelize.org/master/manual/model-basics.html#model-synchronization
		await this._sequelize.sync({ alter: true })
		return this
	}
}

module.exports = { Database }
