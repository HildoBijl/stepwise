import { createUmzug } from './migrations.ts'
import { createSequelize } from './sequelize.ts'

const sequelize = createSequelize({ admin: true })
const umzug = createUmzug(sequelize)

try {
	const action = process.argv[2] ?? 'status'
	if (action === 'status') {
		await printPendingMigrations(umzug)
	} else if (action === 'up') {
		await printPendingMigrations(umzug)
		await migrateUp(umzug)
	} else if (action === 'down') {
		await printPendingMigrations(umzug)
		await migrateDown(umzug)
	} else {
		throw new Error(`Invalid migration action "${action}". Expected "status", "up" or "down".`)
	}
} finally {
	await sequelize.close()
}

async function printPendingMigrations(umzug: ReturnType<typeof createUmzug>): Promise<void> {
	const pending = await umzug.pending()
	if (pending && pending.length > 0) {
		console.log('Pending migration scripts:')
		pending.forEach((migration, index) => { console.log(`${index + 1}: ${migration.name}`) })
	} else {
		console.log('No pending migrations scripts')
	}
}

async function migrateUp(umzug: ReturnType<typeof createUmzug>): Promise<unknown> {
	return umzug.up()
}

async function migrateDown(umzug: ReturnType<typeof createUmzug>): Promise<unknown> {
	return umzug.down()
}
