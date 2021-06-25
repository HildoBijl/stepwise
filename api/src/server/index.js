const express = require('express')
const { ApolloServer, AuthenticationError } = require('apollo-server-express')
const session = require('express-session')
const { typeDefs, resolvers } = require('../graphql')
const { createAuthHandler } = require('./authHandler')
const cors = require('cors')
const Joi = require('@hapi/joi')
const SurfConextAuthStrategy = require('./surfConext/authStrategy').AuthStrategy

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
			 * Returns the id of the currently logged in user, or throws an error otherwise.
			 * Beware: this doesn’t guarantee you that the user still exists in the DB!
			 */
			getCurrentUserId: () => {
				if (!req.session.principal || !req.session.principal.id)
					throw new AuthenticationError('No user is logged in.')
				return req.session.principal.id
			},

			/**
			 * Returns the currently logged in user object, or throws an error otherwise.
			 */
			getCurrentUser: async () => {
				if (!req.session.principal || !req.session.principal.id)
					throw new AuthenticationError('No user is logged in.')
				const user = await database.User.findByPk(req.session.principal.id)
				if (!user) {
					throw new AuthenticationError('No such user in the system.')
				}
				return user
			},

			/**
			 * Returns a boolean: is the user an admin.
			 */
			ensureAdmin: async () => {
				if (!req.session.principal)
					throw new AuthenticationError('No user is logged in.')
				const user = await database.User.findByPk(req.session.principal.id)
				if (user.role !== 'admin')
					throw new AuthenticationError('No admin rights.')
			}
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

	app.use('/auth/surfconext', createAuthHandler(
		config.homepageUrl, new SurfConextAuthStrategy(database, surfConextClient)
	))

	app.set('trust proxy', true)
	return app
}

module.exports = {
	createServer
}
