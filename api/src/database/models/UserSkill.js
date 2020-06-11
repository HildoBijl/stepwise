const userSkill = (sequelize, DataTypes) => {
	const UserSkill = sequelize.define('userSkill', {
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
		skillId: { // For example 'gasLaw'.
			type: DataTypes.STRING,
			allowNull: false,
		},
		coefficients: {
			type: DataTypes.ARRAY(DataTypes.DOUBLE),
			defaultValue: [1],
			allowNull: false,
		},
		coefficientsOn: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
			allowNull: false,
		},
		highest: {
			type: DataTypes.ARRAY(DataTypes.DOUBLE),
			defaultValue: [1],
			allowNull: false,
		},
		highestOn: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
			allowNull: false,
		},
	}, {
		indexes: [{
			unique: true,
			fields: ['userId', 'skillId'],
		}]
	})

	UserSkill.associate = models => {
		UserSkill.belongsTo(models.User)

		UserSkill.hasMany(models.ExerciseSample, { onDelete: 'CASCADE' }) // ToDo: check if we can use composite foreign keys for links. It seems not: sequelize doesn't support this.
		UserSkill.belongsTo(models.ExerciseSample, { as: 'currentExercise', constraints: false, allowNull: true, defaultValue: null })
	}

	return UserSkill
}

module.exports = userSkill
