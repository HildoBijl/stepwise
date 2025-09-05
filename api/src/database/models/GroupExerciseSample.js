const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
	const GroupExerciseSample = sequelize.define('groupExerciseSample', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true,
		},
		skillId: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		exerciseId: {
			type: DataTypes.TEXT,
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

	GroupExerciseSample.associate = models => {
		GroupExerciseSample.belongsTo(models.Group, { onDelete: 'CASCADE', hooks: true })
		GroupExerciseSample.hasMany(models.GroupExerciseEvent, { as: 'events', onDelete: 'CASCADE', hooks: true })
	}

	return GroupExerciseSample
}
