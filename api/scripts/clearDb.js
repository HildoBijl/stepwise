const { Database } = require('../src/database')
const { createSequelize } = require('./init')

const sequelize = createSequelize()

sequelize.authenticate()
	.then(() => new Database(sequelize))
	.then(async () => {
		await sequelize.drop()
		await sequelize.sync({ force: true })
	})
	.catch(console.error)
