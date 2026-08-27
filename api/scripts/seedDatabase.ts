import { SurfConext } from '../src/modules/authentication/index.ts'
import { Database } from '../src/database.ts'

import { createSequelize } from './sequelize.ts'

if (process.env.NODE_ENV !== 'development') process.exit(1)

// The main procedure for populating test data into the DB.
async function seedTestData(db: Database): Promise<void> {
	// Find a date two minutes ago to start adding elements.
	const date = new Date()
	date.setSeconds(date.getSeconds() - 120)
	const getNextDate = () => {
		date.setSeconds(date.getSeconds() + 1)
		return new Date(date)
	}
	console.log('Filling database with sample data ...')

	// Create a user.
	const user = await db.User.create({
		id: '01234567-89ab-cdef-0123-456789abcdef',
		name: 'Step Wise',
		givenName: 'Step',
		familyName: 'Wise',
		email: 'step@wise.com',
		createdAt: getNextDate(),
	})
	const surfConextMockUser = SurfConext.mockUsers.find(candidate => candidate.email === user.email)
	if (surfConextMockUser) {
		await db.SurfConextProfile.create({
			id: surfConextMockUser.sub,
			userId: user.id,
			schacHomeOrganization: surfConextMockUser.schac_home_organization,
		})
	}

	// Create skills for the user.
	const skills = await Promise.all([
		db.UserSkill.create({ userId: user.id, skillId: 'summation', coefficients: [0, 0, 1], highest: [0, 0, 1], numPracticed: 3, createdAt: getNextDate() }),
		db.UserSkill.create({ userId: user.id, skillId: 'multiplication', coefficients: [0, 1], highest: [0, 0.2, 0.8], numPracticed: 2, createdAt: getNextDate() }),
		db.UserSkill.create({ userId: user.id, skillId: 'summationAndMultiplication', coefficients: [1, 0], highest: [1], numPracticed: 1, createdAt: getNextDate() }),
	])

	// Create exercises related to the example skill.
	const summation = skills[0]
	const multiplication = skills[1]
	const exercises = await Promise.all([
		db.ExerciseSample.create({ userSkillId: summation.id, exerciseId: 'summation1', parameters: { a: { type: "Integer", value: "37" }, b: { type: "Integer", value: "42" } }, active: false, createdAt: getNextDate() }),
		db.ExerciseSample.create({ userSkillId: summation.id, exerciseId: 'summation1', parameters: { a: { type: "Integer", value: "64" }, b: { type: "Integer", value: "32" } }, active: true, createdAt: getNextDate() }),
		db.ExerciseSample.create({ userSkillId: multiplication.id, exerciseId: 'multiplication1', parameters: { a: { type: "Integer", value: "8" }, b: { type: "Integer", value: "4" } }, active: true, createdAt: getNextDate() }),
	])
	const events = await Promise.all([
		db.ExerciseEvent.create({ exerciseSampleId: exercises[0].id, action: { type: 'input', input: { ans: { type: 'Integer', value: '80' } } }, state: {}, createdAt: getNextDate() }),
		db.ExerciseEvent.create({ exerciseSampleId: exercises[0].id, action: { type: 'input', input: { ans: { type: 'Integer', value: '79' } } }, state: { solved: true, done: true }, createdAt: getNextDate() }),
		db.ExerciseEvent.create({ exerciseSampleId: exercises[1].id, action: { type: 'input', input: { ans: { type: 'Integer', value: '90' } } }, state: {}, createdAt: getNextDate() }),
		db.ExerciseEvent.create({ exerciseSampleId: exercises[2].id, action: { type: 'input', input: { ans: { type: 'Integer', value: '30' } } }, state: {}, createdAt: getNextDate() }),
		db.ExerciseEvent.create({ exerciseSampleId: exercises[2].id, action: { type: 'input', input: { ans: { type: 'Integer', value: '31' } } }, state: {}, createdAt: getNextDate() }),
	])
}

// Wipe database and apply seeds freshly.
const sequelize = createSequelize()
try {
	await sequelize.authenticate()
	const db = new Database(sequelize)
	await sequelize.sync({ force: true })
	await seedTestData(db)
} catch (error) {
	console.error(error)
	process.exitCode = 1
} finally {
	await sequelize.close()
}
