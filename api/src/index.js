require('dotenv').config()
const { Sequelize } = require('sequelize')
const { createServer } = require('./server')
const { Database } = require('./database')
const { SurfConext } = require('./openid')

const sequelize = new Sequelize(
	process.env.POSTGRES_DB,
	process.env.POSTGRES_USER,
	process.env.POSTGRES_PASSWORD,
	{
		host: process.env.POSTGRES_HOST,
		port: process.env.POSTGRES_PORT,
		dialect: 'postgres',
		dialectOptions: {
			ssl: process.env.POSTGRES_SSLCERT === 'null' ? false : {
				ca: process.env.POSTGRES_SSLCERT.replace(/\\n/g, '\n')
			},
		},
		logging: process.env.NODE_ENV === 'development' ? console.log : false,
})

const surfConext = new SurfConext(
	process.env.SURFCONEXT_ISSUER_URL,
	process.env.SURFCONEXT_REDIRECT_URL,
	process.env.SURFCONEXT_CLIENT_ID,
	process.env.SURFCONEXT_SECRET,
)

const sessionConfig = {
	secret: process.env.SESSION_SECRET,
	maxAgeMillis: process.env.SESSION_MAXAGE_HOURS*60*60*1000,
	homepageUrl: process.env.SESSION_HOMEPAGE_URL,
}

sequelize.authenticate()
	.then(() => new Database(sequelize))
	.then(database => database.dangerouslySyncDatabaseSchema())
	.then(database => {
		const server = createServer({
			database,
			sessionConfig,
			surfConext,
		})
		server.listen(process.env.PORT, () => {
			console.log(`Server listening on port ${process.env.PORT}`)
		})
	})
