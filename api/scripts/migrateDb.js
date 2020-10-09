const { createSequelize, createUmzug } = require('./init')

const sequelize = createSequelize(true)
const umzug = createUmzug(sequelize)

;(async () => {
	await printPendingMigrations(umzug)
	const action = process.argv[2]
	if (action === 'up') {
		await migrateUp(umzug)
	}
	if (action === 'down') {
		await migrateDown(umzug)
	}
	await sequelize.close()
})()

async function printPendingMigrations(umzug) {
	const pending = await umzug.pending()
	if (pending && pending.length > 0) {
		console.log('Pending migration scripts:')
		pending.forEach((m, i) => {
			console.log(`${i + 1}: ${m.file}`)
		})
	} else {
		console.log('No pending migrations scripts')
	}
}

async function migrateUp(umzug) {
	try {
		return await umzug.up()
	} catch(e) {
		console.error(e)
		process.exit(1)
	}
}

async function migrateDown(umzug) {
	try {
		return await umzug.down()
	} catch (e) {
		console.error(e)
		process.exit(1)
	}
}
