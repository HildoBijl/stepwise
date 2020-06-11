const exerciseSample = (sequelize, DataTypes) => {
	const ExerciseSample = sequelize.define('exerciseSample', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true,
		},
		// userId: {
		// 	type: DataTypes.UUID,
		// 	allowNull: false,
		// },
		// skillId: {
		// 	type: DataTypes.STRING,
		// 	allowNull: false,
		// },
		// number: { // Separately incrementing number for each UserSkill. (Can be based on createdAt?)
		// 	type: DataTypes.INTEGER,
		// 	allowNull: false,
		//   // autoIncrement: true, // ToDo: check if this can work as desired: incrementing per unique ['userId','skillId'].
		// },
		exerciseId: { // For example 'gasLawAppliedToBalloon'.
			type: DataTypes.STRING,
			allowNull: false,
		},
		state: {
			type: DataTypes.JSON,
			allowNull: false,
		},
		status: {
			type: DataTypes.ENUM('started', 'solved', 'split', 'splitSolved', 'givenUp'),
			allowNull: false,
		},
	})

	ExerciseSample.associate = models => {
		ExerciseSample.belongsTo(models.UserSkill)
		ExerciseSample.hasOne(models.UserSkill, { as: 'currentExercise', constraints: false, allowNull: true, defaultValue: null })

		ExerciseSample.hasMany(models.ExerciseSubmission, { onDelete: 'CASCADE' }) // ToDo: check if we can use composite foreign keys for links. It seems not: sequelize doesn't support this.
	}

	return ExerciseSample
}

module.exports = exerciseSample
