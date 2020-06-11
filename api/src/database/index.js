const { DataSource } = require('apollo-datasource')
const { sequelize } = require('sequelize')

const modelKeys = ['User', 'UserSkill', 'ExerciseSample', 'ExerciseSubmission']

class Database extends DataSource {
	constructor(sequelizeInstance) {
		super()

		// Import all the models.
		modelKeys.forEach(key => {
			this[key] = sequelizeInstance.import(`./models/${key}`)
		})

		// Make associations.
		modelKeys.forEach(key => {
			if (this[key].associate)
				this[key].associate(this)
		})

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
		exampleSkill.update({ currentExerciseId: exercises[2].id })
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
