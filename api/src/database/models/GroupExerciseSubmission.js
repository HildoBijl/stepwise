const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
	const GroupExerciseSubmission = sequelize.define('groupExerciseSubmission', {
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

	GroupExerciseSubmission.associate = models => {
		GroupExerciseSubmission.belongsTo(models.User, { onDelete: 'CASCADE' })
		GroupExerciseSubmission.belongsTo(models.GroupExerciseEvent, { onDelete: 'CASCADE' })
	}

	return GroupExerciseSubmission
}
