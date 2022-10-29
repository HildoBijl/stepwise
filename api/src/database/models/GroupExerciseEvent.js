const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
	const GroupExerciseEvent = sequelize.define('groupExerciseEvent', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true,
		},
		progress: {
			type: DataTypes.JSON,
			allowNull: false,
		},
	})

	GroupExerciseEvent.associate = models => {
		GroupExerciseEvent.belongsTo(models.GroupExerciseSample)
		GroupExerciseEvent.hasMany(models.GroupExerciseAction, { as: 'actions' })
	}

	return GroupExerciseEvent
}
