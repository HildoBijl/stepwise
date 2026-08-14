import { createUmzug } from './migrations'
import { createSequelize } from './sequelize'

const sequelize = createSequelize(true)
const umzug = createUmzug(sequelize)

;(async () => {
	await printPendingMigrations(umzug)
	const action = process.argv[2]
	if (action === 'up') await migrateUp(umzug)
	if (action === 'down') await migrateDown(umzug)
	await sequelize.close()
})()

async function printPendingMigrations(umzug: any): Promise<void> {
	const pending = await umzug.pending()
	if (pending && pending.length > 0) {
		console.log('Pending migration scripts:')
		pending.forEach((migration: { file: string }, index: number) => { console.log(`${index + 1}: ${migration.file}`) })
	} else {
		console.log('No pending migrations scripts')
	}
}

async function migrateUp(umzug: any): Promise<unknown> {
	try {
		return await umzug.up()
	} catch (error) {
		console.error(error)
		process.exit(1)
	}
}

async function migrateDown(umzug: any): Promise<unknown> {
	try {
		return await umzug.down()
	} catch (e) {
		console.error(e)
		process.exit(1)
	}
}
