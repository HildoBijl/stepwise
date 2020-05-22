require('dotenv').config()
const { Sequelize } = require('sequelize')
const { createServer } = require('./server')
const { Database } = require('./database')

const sequelize = new Sequelize(
	process.env.POSTGRES_DB,
	process.env.POSTGRES_USER,
	process.env.POSTGRES_PASSWORD,
	{
		host: process.env.POSTGRES_HOST,
		port: process.env.POSTGRES_PORT,
		dialect: 'postgres',
		dialectOptions: {
			ssl: process.env.POSTGRES_SSL === 'true',
		},
		logging: process.env.NODE_ENV === 'development' ? console.log : false,
})

sequelize.authenticate()
	.then(() => new Database(sequelize))
	.then(database => database.dangerouslySyncDatabaseSchema())
	.then(database => {
		const server = createServer(database)
		server.listen({ port: process.env.PORT }).then(({ port }) => {
			console.log(`Server listening on port ${port}`)
		})
	})
