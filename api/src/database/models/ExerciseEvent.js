module.exports = (sequelize, DataTypes) => {
	const ExerciseEvent = sequelize.define('exerciseEvent', {
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
		progress: {
			type: DataTypes.JSON,
			allowNull: false,
		},
	})

	ExerciseEvent.associate = models => {
		ExerciseEvent.belongsTo(models.ExerciseSample)
	}

	return ExerciseEvent
}

