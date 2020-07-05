module.exports = (sequelize, DataTypes) => {
	const ExerciseSample = sequelize.define('exerciseSample', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true,
		},
		exerciseId: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		state: {
			type: DataTypes.JSON,
			allowNull: false,
		},
		active: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
			allowNull: false,
		},
	})

	ExerciseSample.associate = models => {
		ExerciseSample.belongsTo(models.UserSkill)
		ExerciseSample.hasMany(models.ExerciseEvent, { as: 'events', onDelete: 'CASCADE' })
	}

	return ExerciseSample
}
