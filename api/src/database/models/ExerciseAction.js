module.exports = (sequelize, DataTypes) => {
	const ExerciseAction = sequelize.define('exerciseAction', {
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

	ExerciseAction.associate = models => {
		ExerciseAction.belongsTo(models.ExerciseSample)
	}

	return ExerciseAction
}

