const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
	const groupExerciseSubmission = sequelize.define('groupExerciseSubmission', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true,
		},
		action: {
			type: DataTypes.JSON,
			allowNull: false,
		},
	}, {
		indexes: [
			{
				fields: ['userId', 'groupExerciseEventId'],
				unique: true,
			}
		]
	})

	groupExerciseSubmission.associate = models => {
		groupExerciseSubmission.belongsTo(models.User)
		groupExerciseSubmission.belongsTo(models.GroupExerciseEvent)
	}

	return groupExerciseSubmission
}
