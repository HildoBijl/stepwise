const express = require('express')
const { createApollo } = require('./apollo')
const session = require('express-session')
const cors = require('cors')
const Joi = require('@hapi/joi')
const { createAuthRouter } = require('./auth')

const configValidationSchema = Joi.object({
	sslEnabled: Joi.boolean().required(),
	sessionSecret: Joi.string().min(20).required(),
	sessionMaxAgeMillis: Joi.number().required(),
	homepageUrl: Joi.string().uri().required(),
	corsUrls: Joi.array().items(Joi.string().uri()),
})

const createServer = ({
	config,
	database,
	sessionStore,
	surfConextClient,
	googleClient,
}) => {
	const configValidationError = configValidationSchema.validate(config).error
	if (configValidationError) {
		throw configValidationError
	}

	const app = express()

	app.use(session({
		name: 'session.id',
		store: sessionStore,
		secret: config.sessionSecret,
		resave: false,
		saveUninitialized: false,
		rolling: true,
		cookie: {
			secure: config.sslEnabled,
			sameSite: 'Lax',
			httpOnly: true,
			maxAge: config.sessionMaxAgeMillis,
		},
		principal: null,
	}))

	const corsOptions = {
		origin: config.corsUrls,
		credentials: true,
	}
	app.use(cors(corsOptions))

	// Apollo / GraphQL
	const apollo = createApollo(database)
	apollo.applyMiddleware({ app, cors: corsOptions, path: '/graphql' })

	// Authentication Endpoints
	app.use('/auth', createAuthRouter(
		config,
		database,
		{ surfConextClient, googleClient })
	)

	app.set('trust proxy', true)
	return app
}

module.exports = {
	createServer
}
