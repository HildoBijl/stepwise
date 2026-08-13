import http from 'node:http'
import express from 'express'
import session from 'express-session'
import cors from 'cors'
import { ApolloServer, AuthenticationError } from 'apollo-server-express'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { ApolloServerPluginDrainHttpServer, ApolloServerPluginLandingPageGraphQLPlayground, ApolloServerPluginLandingPageDisabled } from 'apollo-server-core'
import { execute, subscribe } from 'graphql'
import { SubscriptionServer } from 'subscriptions-transport-ws'

import { createAuthRouter } from '../modules/authentication'
import { createI18nRouter } from '../modules/i18n'
import { typeDefs, resolvers } from '../graphql'

import type { ApiServer, CreateServerOptions, SessionRequest } from './types'
import { createApolloContext } from './apolloContext'
import { validateServerConfig } from './config'
import { getIdFromRequest } from './support'

export async function createServer({ config, database, sessionStore, surfConextClient, googleClient, pubsub, useI18n, devAuthPortal }: CreateServerOptions): Promise<ApiServer> {
	validateServerConfig(config)

	const corsOptions = { origin: config.corsUrls, credentials: true }

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
			sameSite: config.sslEnabled ? 'none' : 'lax',
			httpOnly: true,
			domain: config.apiDomain,
			maxAge: config.sessionMaxAgeMillis,
		},
	})
	app.use(processSession)
	app.set('trust proxy', true)
	app.use(cors(corsOptions))

	// Create HTTP server
	const httpServer = http.createServer(app)

	// Authentication endpoints
	app.use('/auth', createAuthRouter(config, database, { surfConextClient, googleClient }))

	// Language file submission from i18n
	if (useI18n) app.use('/locales', createI18nRouter())

	// Development auth portal
	if (devAuthPortal) app.get(devAuthPortal.path, devAuthPortal.directory)

	// Apollo / GraphQL
	const contextProvider = createApolloContext(database, pubsub)
	const schema = makeExecutableSchema({ typeDefs, resolvers })
	const subscriptionServer = SubscriptionServer.create({
		schema,
		execute,
		subscribe,
		async onConnect(_connectionParams: unknown, webSocket: any) {
			// Attach session object to upgrade request.
			const request = await new Promise<SessionRequest>((resolve, reject) => {
				processSession(webSocket.upgradeReq, {} as any, error => error ? reject(error) : resolve(webSocket.upgradeReq))
			})
			// Ensure that only logged-in users can connect to the socket.
			if (!getIdFromRequest(request as any)) throw new AuthenticationError('No user is logged in. Web socket not allowed.')
			// Return the context at connection time to the socket.
			return contextProvider({ req: request as any })
		},
	}, { server: httpServer, path: '/graphql' })

	const apolloServer = new ApolloServer({
		schema,
		context: contextProvider,
		plugins: [
			// Shutdown HTTP server
			ApolloServerPluginDrainHttpServer({ httpServer }),

			// Shutdown the WebSocket server
			{
				async serverWillStart() {
					return { async drainServer() { subscriptionServer.close() } }
				},
			},

			// Playground (only in development)
			devAuthPortal ? ApolloServerPluginLandingPageGraphQLPlayground({ settings: { 'request.credentials': 'same-origin' } }) : ApolloServerPluginLandingPageDisabled(),
		],
	})
	await apolloServer.start()
	apolloServer.applyMiddleware({ app, cors: corsOptions, path: '/graphql' })
	const apiServer = httpServer as ApiServer
	apiServer.stop = () => apolloServer.stop()

	return apiServer
}
