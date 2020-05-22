require('dotenv').config()
const { server } = require('./server')
const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(
	process.env.POSTGRES_DB,
	process.env.POSTGRES_USER,
	process.env.POSTGRES_PASSWORD,
	{
		host: process.env.POSTGRES_HOST,
		port: process.env.POSTGRES_PORT,
		dialect: 'postgres',
		logging: process.env.NODE_ENV === 'development' ? console.log : false,
})

sequelize.authenticate().then(async () => {
	server.listen({ port: process.env.PORT }).then(({ port }) => {
		console.log(`Server listening on port ${port}`)
	})
})
