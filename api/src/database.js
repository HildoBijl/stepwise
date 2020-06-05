const { DataSource } = require('apollo-datasource')
const { DataTypes } = require('sequelize')

class Database extends DataSource {
	constructor(sequelizeInstance) {
		super()

		this.User = sequelizeInstance.define('User', {
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				allowNull: false,
				primaryKey: true,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
			}
		})

		this.Exercise = sequelizeInstance.define('Exercise', {
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			}
		})
		this.Exercise.belongsTo(this.User)

		// TODO Remove this once `dangerouslySyncDatabaseSchema` is gone
		this._sequelize = sequelizeInstance
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
