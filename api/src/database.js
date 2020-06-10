const { DataSource } = require('apollo-datasource')
const { DataTypes } = require('sequelize')

class Database extends DataSource {
	constructor(sequelizeInstance) {
		super()

		this.User = sequelizeInstance.define('user', {
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
			email: {
				type: DataTypes.STRING,
				allowNull: false,
			}
		})

		this.UserSkill = sequelizeInstance.define('userSkill', {
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
		this.UserSkill.belongsTo(this.User, { onDelete: 'cascade' })

		this.ExerciseSample = sequelizeInstance.define('exerciseSample', {
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
		this.ExerciseSample.belongsTo(this.UserSkill, { onDelete: 'cascade' }) // ToDo: check if we can use composite foreign keys for links. It seems not: sequelize doesn't support this.

		this.ExerciseSubmission = sequelizeInstance.define('exerciseSubmission', {
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
		this.ExerciseSubmission.belongsTo(this.ExerciseSample, { onDelete: 'cascade' }) // ToDo: check if we can use composite foreign keys for links. It seems not: sequelize doesn't support this.

		// TODO Remove this once `dangerouslySyncDatabaseSchema` is gone
		this._sequelize = sequelizeInstance
	}

	async dangerouslySyncDatabaseSchema() {
		// TODO Don’t use syncing in production, because it might erase entire tables.
		// Introduce proper migrations at some point!
		// See https://sequelize.org/master/manual/model-basics.html#model-synchronization
		await this._sequelize.sync({ force: true })
		return this
	}

	async fillWithSampleData() {
		if (process.env.NODE_ENV !== 'development')
			return

		// Find a date two minutes ago to start adding elements.
		const date = new Date()
		date.setSeconds(date.getSeconds() - 120)
		console.log('Filling database with sample data ...')

		// Create a user.
		const user = await this.User.create({ id: '00000000-0000-0000-0000-000000000000', name: 'Step', email: 'step@wise.com', createdAt: date.setSeconds(date.getSeconds() + 1) })
		console.log(user.id)

		// Create skills for the user.
		const skills = await Promise.all([
			this.UserSkill.create({ userId: user.id, skillId: 'example', createdAt: date.setSeconds(date.getSeconds() + 1) }),
			// this.UserSkill.create({ userId: user.id, skillId: 'a', createdAt: date.setSeconds(date.getSeconds() + 1) }),
			// this.UserSkill.create({ userId: user.id, skillId: 'b', createdAt: date.setSeconds(date.getSeconds() + 1) }),
			// this.UserSkill.create({ userId: user.id, skillId: 'x', createdAt: date.setSeconds(date.getSeconds() + 1) }),
		])

		// Create exercises related to the example skill.
		const exampleSkill = skills[0]
		const exercises = await Promise.all([
			this.ExerciseSample.create({ userSkillId: exampleSkill.id, exerciseId: 'exampleExercise1', state: { a: 9, b: 54 }, status: 'givenUp', createdAt: date.setSeconds(date.getSeconds() + 1) }),
			this.ExerciseSample.create({ userSkillId: exampleSkill.id, exerciseId: 'exampleExercise1', state: { a: 2, b: 6 }, status: 'solved', createdAt: date.setSeconds(date.getSeconds() + 1) }),
			this.ExerciseSample.create({ userSkillId: exampleSkill.id, exerciseId: 'exampleExercise1', state: { a: 7, b: 63 }, status: 'started', createdAt: date.setSeconds(date.getSeconds() + 1) }),
		])
		const submissions = await Promise.all([
			this.ExerciseSubmission.create({ exerciseSampleId: exercises[0].id, input: { x: 7 }, correct: false, createdAt: date.setSeconds(date.getSeconds() + 1) }),
			this.ExerciseSubmission.create({ exerciseSampleId: exercises[0].id, input: { x: 11 }, correct: false, createdAt: date.setSeconds(date.getSeconds() + 1) }),
			this.ExerciseSubmission.create({ exerciseSampleId: exercises[1].id, input: { x: 4 }, correct: false, createdAt: date.setSeconds(date.getSeconds() + 1) }),
			this.ExerciseSubmission.create({ exerciseSampleId: exercises[1].id, input: { x: 3 }, correct: false, createdAt: date.setSeconds(date.getSeconds() + 1) }),
		])

		return this
	}
}

module.exports = { Database }
