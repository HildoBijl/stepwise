import http from 'node:http'
import express, { type Request, type Response } from 'express'
import session from 'express-session'
import cors from 'cors'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express5'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled'
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/use/ws'

import { createAuthRouter } from '../modules/authentication/index.ts'
import { createI18nRouter } from '../modules/i18n/index.ts'
import { typeDefs, resolvers } from '../graphql/index.ts'

import type { ApiServer, CreateServerOptions, SessionRequest } from './types.ts'
import { getIdFromRequest } from './support.ts'
import { validateServerConfig } from './config.ts'
import { createApolloContext } from './apolloContext.ts'

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
	const webSocketServer = new WebSocketServer({ server: httpServer, path: '/graphql' })
	const webSocketCleanup = useServer({
		schema,
		async onConnect(context) {
			// Attach session object to upgrade request.
			const upgradeRequest = context.extra.request
			const request = await new Promise<SessionRequest>((resolve, reject) => {
				processSession(upgradeRequest as Request, {} as Response, error => error ? reject(error) : resolve(upgradeRequest as SessionRequest))
			})
			// Ensure that only logged-in users can connect to the socket.
			if (!getIdFromRequest(request)) return false
		},
		context: context => contextProvider({ req: context.extra.request as SessionRequest }),
	}, webSocketServer)

	const apolloServer = new ApolloServer({
		schema,
		plugins: [
			// Shutdown HTTP server
			ApolloServerPluginDrainHttpServer({ httpServer }),

			// Shutdown the WebSocket server
			{
				async serverWillStart() {
					return { async drainServer() { await webSocketCleanup.dispose() } }
				},
			},

			// Apollo Sandbox (only in development)
			devAuthPortal ? ApolloServerPluginLandingPageLocalDefault({ includeCookies: true }) : ApolloServerPluginLandingPageDisabled(),
		],
	})
	await apolloServer.start()
	app.use('/graphql', express.json(), expressMiddleware(apolloServer, { context: contextProvider }))
	const apiServer = httpServer as ApiServer
	apiServer.stop = () => apolloServer.stop()

	return apiServer
}
