module.exports = (sequelize, DataTypes) => {
  const ExerciseSubmission = sequelize.define('exerciseSubmission', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true,
		},
		input: {
			type: DataTypes.JSON,
			allowNull: false,
		},
		// correct: {
		// 	type: DataTypes.JSON,
		// 	allowNull: false,
		// },
	})

  ExerciseSubmission.associate = models => {
		ExerciseSubmission.belongsTo(models.ExerciseSample)
	}

  return ExerciseSubmission
}

