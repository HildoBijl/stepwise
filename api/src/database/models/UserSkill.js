module.exports = (sequelize, DataTypes) => {
	const UserSkill = sequelize.define('userSkill', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true,
		},
		skillId: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		numPracticed: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
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
		UserSkill.hasMany(models.ExerciseSample, { as: 'exercises', onDelete: 'CASCADE' })
	}

	return UserSkill
}
