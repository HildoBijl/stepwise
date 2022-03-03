const { DataTypes } = require('sequelize')

const modelKeys = [
	'User',
	'SurfConextProfile',
	'UserSkill',
	'ExerciseSample',
	'ExerciseEvent',
	'Group',
]

class Database {
	constructor(sequelize) {
		this._sequelize = sequelize

		// Import all the models.
		modelKeys.forEach(key => {
			this[key] = require(`./models/${key}`)(sequelize)
		})

		// Make associations.
		modelKeys.forEach(key => {
			if (this[key].associate)
				this[key].associate(this)
		})
	}

	async transaction(procedure) {
		return await this._sequelize.transaction(procedure)
	}
}

module.exports = { Database }
