const { DataSource } = require('apollo-datasource')
const { DataTypes } = require('sequelize')

class Database extends DataSource {
	constructor(sequelizeInstance) {
		super()
		this.sequelize = sequelizeInstance
		this.models = {
			Exercise: this.sequelize.define('Exercise', {
				name: {
					type: DataTypes.STRING,
					allowNull: false,
				}
			})
		}
	}

	async dangerouslySyncDatabaseSchema() {
		// TODO Don’t use syncing in production, because it might erase entire tables.
		// Introduce proper migrations at some point!
		// See https://sequelize.org/master/manual/model-basics.html#model-synchronization
		await this.sequelize.sync({ alter: true })
		return this
	}

	async getAllExercises() {
		return await this.models.Exercise.findAll()
	}
}

module.exports = { Database }
