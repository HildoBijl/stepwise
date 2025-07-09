const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
	const CourseBlock = sequelize.define('courseBlock', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		goals: {
			type: DataTypes.ARRAY(DataTypes.STRING),
			allowNull: false,
		},
		order: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	})

	CourseBlock.associate = models => {
		CourseBlock.belongsTo(models.Course)
	}

	return CourseBlock
}
