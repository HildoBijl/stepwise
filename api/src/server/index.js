const express = require('express')
const http = require('http')
const { createApolloContext } = require('./apollo')
const session = require('express-session')
const cors = require('cors')
const Joi = require('@hapi/joi')
const { createAuthRouter } = require('./auth')
const { typeDefs, resolvers } = require('../graphql')
const { ApolloServer } = require('apollo-server-express')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { ApolloServerPluginDrainHttpServer, ApolloServerPluginLandingPageGraphQLPlayground, ApolloServerPluginLandingPageDisabled } = require('apollo-server-core')
const { execute, subscribe } = require('graphql')
const { SubscriptionServer } = require('subscriptions-transport-ws')

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

const createServer = async ({
	config,
	database,
	sessionStore,
	surfConextClient,
	googleClient,
	pubsub,
	devAuthPortal,
}) => {
	const configValidationError = configValidationSchema.validate(config).error
	if (configValidationError) {
		throw configValidationError
	}

	const corsOptions = {
		origin: config.corsUrls,
		credentials: true,
	}

	// Basic server setup
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
	app.set('trust proxy', true)
	app.use(cors(corsOptions))

	// Create HTTP server
	const httpServer = http.createServer(app)

	// Authentication Endpoints
	app.use('/auth', createAuthRouter(
		config,
		database,
		{ surfConextClient, googleClient })
	)

	// Development auth portal
	if (devAuthPortal) {
		app.get(devAuthPortal.path, devAuthPortal.directory)
	}

	// Apollo / GraphQL
	const schema = makeExecutableSchema({ typeDefs, resolvers })
	const subscriptionServer = SubscriptionServer.create({
		schema,
		execute,
		subscribe,
		onConnect() {
			return {database, pubsub}
		},
	}, {
		server: httpServer,
		path: '/graphql',
	})
	const apolloServer = new ApolloServer({
		schema,
		context: createApolloContext(database, pubsub),
		plugins: [
			// Shutdown HTTP server
			ApolloServerPluginDrainHttpServer({ httpServer }),

			// Shutdown for the WebSocket server
			{
				async serverWillStart() {
					return {
						async drainServer() {
							subscriptionServer.close()
						}
					}
				}
			},

			// Playground (only in development)
			!!devAuthPortal ? ApolloServerPluginLandingPageGraphQLPlayground({
				settings: {
					'request.credentials': 'same-origin'
				}
			}) : ApolloServerPluginLandingPageDisabled(),
		],
	})
	await apolloServer.start()
	apolloServer.applyMiddleware({
		app,
		cors: corsOptions,
		path: '/graphql'
	})

	return httpServer
}

module.exports = {
	createServer
}
