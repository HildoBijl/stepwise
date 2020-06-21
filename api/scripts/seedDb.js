const { Database } = require('../src/database')
const { createSequelize } = require('./init')
const surfConextMockData = require('../surfConextMockData.json')

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
	const user = await db.User.create({
		id: '01234567-89ab-cdef-0123-456789abcdef',
		name: 'Step',
		email: 'step@wise.com',
		createdAt: date.setSeconds(date.getSeconds() + 1)
	})
	const surfConextMockUser = surfConextMockData.find(u => u.email === user.email)
	if (surfConextMockUser) {
		await user.createSurfConextProfile({
			sub: surfConextMockUser.sub,
			schacHomeOrganization: surfConextMockUser.schac_home_organization,
		})
	}

	// Create skills for the user.
	const skills = await Promise.all([
		user.createSkill({ skillId: 'example', createdAt: date.setSeconds(date.getSeconds() + 1) }),
	])

	// Create exercises related to the example skill.
	const exampleSkill = skills[0]
	const exercises = await Promise.all([
		exampleSkill.createExercise({ exerciseId: 'exampleExercise1', state: { a: 9, b: 54 }, active: false, createdAt: date.setSeconds(date.getSeconds() + 1) }),
		exampleSkill.createExercise({ exerciseId: 'exampleExercise1', state: { a: 2, b: 6 }, active: false, createdAt: date.setSeconds(date.getSeconds() + 1) }),
		exampleSkill.createExercise({ exerciseId: 'exampleExercise1', state: { a: 7, b: 63 }, active: true, createdAt: date.setSeconds(date.getSeconds() + 1) }),
	])
	const actions = await Promise.all([
		exercises[0].createAction({ action: { type: 'submit', input: { x: 7 } }, progress: {}, createdAt: date.setSeconds(date.getSeconds() + 1) }),
		exercises[0].createAction({ action: { type: 'submit', input: { x: 6 } }, progress: { solved: true, done: true }, createdAt: date.setSeconds(date.getSeconds() + 1) }),
		exercises[1].createAction({ action: { type: 'submit', input: { x: 8 } }, progress: {}, createdAt: date.setSeconds(date.getSeconds() + 1) }),
		exercises[1].createAction({ action: { type: 'submit', input: { x: 9 } }, progress: { solved: true, done: true }, createdAt: date.setSeconds(date.getSeconds() + 1) }),
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
