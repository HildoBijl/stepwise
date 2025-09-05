const express = require('express')
const http = require('http')
const session = require('express-session')
const cors = require('cors')
const Joi = require('@hapi/joi')
const { ApolloServer } = require('apollo-server-express')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { ApolloServerPluginDrainHttpServer, ApolloServerPluginLandingPageGraphQLPlayground, ApolloServerPluginLandingPageDisabled } = require('apollo-server-core')
const { execute, subscribe } = require('graphql')
const { SubscriptionServer } = require('subscriptions-transport-ws')

const { typeDefs, resolvers } = require('../graphql')

const { createApolloContext, getIdFromRequest } = require('./apollo')
const { createAuthRouter } = require('./auth')
const { createI18nRouter } = require('./i18n')

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
	useI18n,
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
	const processSession = session({
		name: 'session.id',
		store: sessionStore,
		secret: config.sessionSecret,
		resave: false,
		saveUninitialized: false,
		rolling: true,
		cookie: {
			secure: config.sslEnabled,
			sameSite: config.sslEnabled ? 'None' : 'Lax',
			httpOnly: true,
			domain: config.apiDomain,
			maxAge: config.sessionMaxAgeMillis,
		},
		principal: null,
	})
	app.use(processSession)
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

	// Language file submission from i18n
	if (useI18n) {
		app.use('/locales', createI18nRouter())
	}

	// Development auth portal
	if (devAuthPortal) {
		app.get(devAuthPortal.path, devAuthPortal.directory)
	}

	// Apollo / GraphQL
	const contextProvider = await createApolloContext(database, pubsub)
	const schema = makeExecutableSchema({ typeDefs, resolvers })
	const subscriptionServer = SubscriptionServer.create({
		schema,
		execute,
		subscribe,
		async onConnect(connectionParams, webSocket, context) {
			// Attach session object to upgrade request
			const upgradeReqWithSession = await new Promise((res) => {
				processSession(webSocket.upgradeReq, {}, () => {
					res(webSocket.upgradeReq)
				})
			})
			// Ensure that only logged-in users can connect to the socket
			if (!getIdFromRequest(upgradeReqWithSession))
				throw new AuthenticationError(`No user is logged in. Web socket not allowed.`)
			// Return the context at connection time to the socket
			return contextProvider({ req: upgradeReqWithSession })
		},
		async onDisconnect(webSocket, context) {
			// data = await context.initPromise
			// user = await data.getCurrentUser(context.request)
		},
	}, {
		server: httpServer,
		path: '/graphql',
	})
	const apolloServer = new ApolloServer({
		schema,
		context: contextProvider,
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
