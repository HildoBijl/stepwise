const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
	const GroupExerciseAction = sequelize.define('groupExerciseAction', {
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

	GroupExerciseAction.associate = models => {
		GroupExerciseAction.belongsTo(models.User)
		GroupExerciseAction.belongsTo(models.GroupExerciseEvent)
	}

	return GroupExerciseAction
}
