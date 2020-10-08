const path = require('path')
const Umzug = require('umzug')
const { createSequelize } = require('./init')

const sequelize = createSequelize()

const umzug = new Umzug({
	migrations: {
		path: path.join(__dirname, '../migrations'),
		params: [
			sequelize.getQueryInterface()
		]
	},
	storage: 'sequelize',
	storageOptions: {
		sequelize: sequelize
	}
})

;(async () => {
	await printPendingMigrations(umzug)
	const action = process.argv[2]
	if (action === 'up') {
		await migrateUp(umzug)
	}
	if (action === 'down') {
		await migrateDown(umzug)
	}
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
