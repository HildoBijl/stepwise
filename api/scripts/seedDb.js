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
			id: surfConextMockUser.sub,
			schacHomeOrganization: surfConextMockUser.schac_home_organization,
		})
	}

	// Create skills for the user.
	const skills = await Promise.all([
		user.createSkill({ skillId: 'summation', coefficients: [0,0,1], highest: [0,0,1], numPracticed: 3, createdAt: date.setSeconds(date.getSeconds() + 1) }),
		user.createSkill({ skillId: 'multiplication', coefficients: [0,1], highest: [0,0.2,0.8], numPracticed: 2, createdAt: date.setSeconds(date.getSeconds() + 1) }),
		user.createSkill({ skillId: 'summationAndMultiplication', coefficients: [1,0], highest: [1], numPracticed: 1, createdAt: date.setSeconds(date.getSeconds() + 1) }),
	])

	// Create exercises related to the example skill.
	const summation = skills[0]
	const multiplication = skills[1]
	const exercises = await Promise.all([
		summation.createExercise({ exerciseId: 'summation1', state: { a: { type: "Integer", value: "37" }, b: { type: "Integer", value: "42" } }, active: false, createdAt: date.setSeconds(date.getSeconds() + 1) }),
		summation.createExercise({ exerciseId: 'summation1', state: { a: { type: "Integer", value: "64" }, b: { type: "Integer", value: "32" } }, active: true, createdAt: date.setSeconds(date.getSeconds() + 1) }),
		multiplication.createExercise({ exerciseId: 'multiplication1', state: { a: { type: "Integer", value: "8" }, b: { type: "Integer", value: "4" } }, active: true, createdAt: date.setSeconds(date.getSeconds() + 1) }),
	])
	const events = await Promise.all([
		exercises[0].createEvent({ action: { type: 'input', input: { ans: { type: 'Integer', value: '80' } } }, progress: {}, createdAt: date.setSeconds(date.getSeconds() + 1) }),
		exercises[0].createEvent({ action: { type: 'input', input: { ans: { type: 'Integer', value: '79' } } }, progress: { solved: true, done: true }, createdAt: date.setSeconds(date.getSeconds() + 1) }),
		exercises[1].createEvent({ action: { type: 'input', input: { ans: { type: 'Integer', value: '90' } } }, progress: {}, createdAt: date.setSeconds(date.getSeconds() + 1) }),
		exercises[2].createEvent({ action: { type: 'input', input: { ans: { type: 'Integer', value: '30' } } }, progress: {}, createdAt: date.setSeconds(date.getSeconds() + 1) }),
		exercises[2].createEvent({ action: { type: 'input', input: { ans: { type: 'Integer', value: '31' } } }, progress: {}, createdAt: date.setSeconds(date.getSeconds() + 1) }),
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
