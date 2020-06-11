const exerciseSubmission = (sequelize, DataTypes) => {
  const ExerciseSubmission = sequelize.define('exerciseSubmission', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true,
		},
		// attempt: { // Separately incrementing number for each ExerciseSample. (Can be based on createdAt?)
		// 	type: DataTypes.INTEGER,
		// 	allowNull: false,
		// 	primaryKey: true,
		//   autoIncrement: true,
		// },
		input: {
			type: DataTypes.JSON,
			allowNull: false,
		},
		// correct: {
		// 	type: DataTypes.BOOLEAN,
		// 	allowNull: false,
		// },
	})

  ExerciseSubmission.associate = models => {
		ExerciseSubmission.belongsTo(models.ExerciseSample)
	}

  return ExerciseSubmission
}

module.exports = exerciseSubmission


