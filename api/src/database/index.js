const { DataSource } = require('apollo-datasource')
const { DataTypes } = require('sequelize')

const modelKeys = ['User', 'UserSkill', 'ExerciseSample', 'ExerciseSubmission']

// TODO remove inheritance once the Database isn’t used as DataSource anymore
class Database extends DataSource {
	constructor(sequelize) {
		super()

		// Import all the models.
		modelKeys.forEach(key => {
			this[key] = require(`./models/${key}`)(sequelize, DataTypes)
		})

		// Make associations.
		modelKeys.forEach(key => {
			if (this[key].associate)
				this[key].associate(this)
		})
	}
}

module.exports = { Database }
