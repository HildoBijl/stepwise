const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
	const CourseBlock = sequelize.define('courseBlock', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true,
		},
		index: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		goals: {
			type: DataTypes.ARRAY(DataTypes.STRING),
			allowNull: false,
		},
	}, {
		defaultScope: {
			order: [['index', 'ASC']]
		},
	})

	CourseBlock.associate = models => {
		CourseBlock.belongsTo(models.Course)
	}

	return CourseBlock
}
