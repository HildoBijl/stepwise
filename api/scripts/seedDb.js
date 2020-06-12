const { Database } = require('../src/database')
const { createSequelize } = require('./init')

if (process.env.NODE_ENV !== 'development') process.exit(1)

/**
 * The main procedure for populating test data into the DB
 */
async function seedTestData(db) {
	// Find a date two minutes ago to start adding elements.
	const date = new Date()
	date.setSeconds(date.getSeconds() - 120)
	console.log('Filling database with sample data ...')

	// Create a user.
	const user = await db.User.create({ id: '00000000-0000-0000-0000-000000000000', name: 'Step', email: 'step@wise.com', createdAt: date.setSeconds(date.getSeconds() + 1) })
	console.log(user.id)

	// Create skills for the user.
	const skills = await Promise.all([
		db.UserSkill.create({ userId: user.id, skillId: 'example', createdAt: date.setSeconds(date.getSeconds() + 1) }),
		// db.UserSkill.create({ userId: user.id, skillId: 'a', createdAt: date.setSeconds(date.getSeconds() + 1) }),
		// db.UserSkill.create({ userId: user.id, skillId: 'b', createdAt: date.setSeconds(date.getSeconds() + 1) }),
		// db.UserSkill.create({ userId: user.id, skillId: 'x', createdAt: date.setSeconds(date.getSeconds() + 1) }),
	])

	// Create exercises related to the example skill.
	const exampleSkill = skills[0]
	const exercises = await Promise.all([
		db.ExerciseSample.create({ userSkillId: exampleSkill.id, exerciseId: 'exampleExercise1', state: { a: 9, b: 54 }, status: 'givenUp', createdAt: date.setSeconds(date.getSeconds() + 1) }),
		db.ExerciseSample.create({ userSkillId: exampleSkill.id, exerciseId: 'exampleExercise1', state: { a: 2, b: 6 }, status: 'solved', createdAt: date.setSeconds(date.getSeconds() + 1) }),
		db.ExerciseSample.create({ userSkillId: exampleSkill.id, exerciseId: 'exampleExercise1', state: { a: 7, b: 63 }, status: 'started', createdAt: date.setSeconds(date.getSeconds() + 1) }),
	])
	exampleSkill.update({ currentExerciseId: exercises[2].id })
	const submissions = await Promise.all([
		db.ExerciseSubmission.create({ exerciseSampleId: exercises[0].id, input: { x: 7 }, correct: false, createdAt: date.setSeconds(date.getSeconds() + 1) }),
		db.ExerciseSubmission.create({ exerciseSampleId: exercises[0].id, input: { x: 11 }, correct: false, createdAt: date.setSeconds(date.getSeconds() + 1) }),
		db.ExerciseSubmission.create({ exerciseSampleId: exercises[1].id, input: { x: 4 }, correct: false, createdAt: date.setSeconds(date.getSeconds() + 1) }),
		db.ExerciseSubmission.create({ exerciseSampleId: exercises[1].id, input: { x: 3 }, correct: false, createdAt: date.setSeconds(date.getSeconds() + 1) }),
	])
}

/**
 * Wipe database and apply seeds freshly
 */
const sequelize = createSequelize()
sequelize.authenticate()
	.then(async () => {
		const db = new Database(sequelize)
		await sequelize.sync({ force: true })
		return db
	})
	.then(seedTestData)
	.catch(console.error)
