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
			ssl: !process.env.POSTGRES_SSLCERT ? false : {
				ca: process.env.POSTGRES_SSLCERT.replace(/\\n/g, '\n')
			},
		},
		logging: process.env.NODE_ENV === 'production' ? false : console.log,
})

const surfConext = new SurfConext(
	process.env.SURFCONEXT_ISSUER_URL,
	process.env.SURFCONEXT_REDIRECT_URL,
	process.env.SURFCONEXT_CLIENT_ID,
	process.env.SURFCONEXT_SECRET,
)

const config = {
	sslEnabled: process.env.NODE_ENV === 'production',
	sessionSecret: process.env.SESSION_SECRET || '',
	sessionMaxAgeMillis: (process.env.SESSION_MAXAGE_HOURS || 1)*60*60*1000,
	homepageUrl: process.env.HOMEPAGE_URL || '',
	corsUrls: (process.env.CORS_URLS || '').split(';'),
}

sequelize.authenticate()
	.then(() => new Database(sequelize))
	.then(database => database.dangerouslySyncDatabaseSchema())
	.then(database => {
		const server = createServer({
			config,
			database,
			surfConext,
		})
		server.listen(process.env.PORT, () => {
			console.log(`Server listening on port ${process.env.PORT}`)
		})
	})
