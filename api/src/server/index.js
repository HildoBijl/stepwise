import express from 'express'
import { createApollo } from './apollo'
import session from 'express-session'
import cors from 'cors'
import Joi from '@hapi/joi'
import { createAuthRouter } from './auth'

const configValidationSchema = Joi.object({
	sslEnabled: Joi.boolean().required(),
	sessionSecret: Joi.string().min(20).required(),
	sessionMaxAgeMillis: Joi.number().required(),
	homepageUrl: Joi.string().uri().required(),
	apiDomain: [
		Joi.string().valid("localhost").required(),
		Joi.string().domain().required(),
	],
	corsUrls: Joi.array().items(Joi.string().uri()),
})

export const createServer = ({
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
			domain: config.apiDomain,
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
