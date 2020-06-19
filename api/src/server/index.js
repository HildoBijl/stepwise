const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const session = require('express-session')
const { typeDefs, resolvers } = require('../graphql')
const { createAuthHandler } = require('./authHandler')
const cors = require('cors')
const Joi = require('@hapi/joi')

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
	authStrategies = {},
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

	const apollo = new ApolloServer({
		typeDefs,
		resolvers,
		context: ({ req }) => ({
			/**
			 * All database models
			 */
			db: database,

			/**
			 * Returns the id of the currently logged in user, or `null` otherwise.
			 * Beware: this doesn’t guarantee you that the user still exists in the DB!
			 */
			getUserId: () => req.session.principal ? req.session.principal.id : null,

			/**
			 * Returns the currently logged in user object, or `null` otherwise.
			 */
			getUser: async () => {
				if (!req.session.principal)
					return null
				return await database.User.findByPk(req.session.principal.id)
			},
		}),
		playground: {
			settings: {
				'request.credentials': 'same-origin'
			}
		}
	})
	apollo.applyMiddleware({ app, cors: corsOptions, path: '/graphql' });

	app.get('/auth/logout', (req, res) => {
		req.session.destroy(() => {
			res.redirect(config.homepageUrl)
		})
	})

	for (const [route, authStrategy] of Object.entries(authStrategies)) {
		app.use(
			`/auth/${route}`,
			createAuthHandler(config.homepageUrl, authStrategy),
		)
	}

	app.set('trust proxy', true)
	return app
}

module.exports = {
	createServer
}
