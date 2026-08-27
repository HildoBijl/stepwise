import http from 'node:http'
import express, { type Request, type RequestHandler, type Response } from 'express'
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
import { getSessionUserId } from './support.ts'
import { validateServerConfig } from './config.ts'
import { createApolloContext } from './apolloContext.ts'

export async function createServer({ config, db, sessionStore, surfConextClient, googleClient, pubsub, useI18n, devAuthPortal }: CreateServerOptions): Promise<ApiServer> {
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
	app.use('/auth', createAuthRouter(config, db, { surfConextClient, googleClient }))

	// Language file submission from i18n
	if (useI18n) app.use('/locales', createI18nRouter())

	// Development auth portal
	if (devAuthPortal) app.get(devAuthPortal.path, devAuthPortal.directory)

	// Apollo / GraphQL
	const contextProvider = createApolloContext(db, pubsub)
	const schema = makeExecutableSchema({ typeDefs, resolvers })
	const webSocketServer = new WebSocketServer({ server: httpServer, path: '/graphql' })
	const webSocketCleanup = useServer({
		schema,
		async onConnect(context) {
			// Attach session object to upgrade request.
			const request = await attachSession(context.extra.request, processSession)
			// Ensure that only logged-in users can connect to the socket.
			if (!getSessionUserId(request)) return false
		},
		context: context => {
			ensureSessionRequest(context.extra.request)
			return contextProvider({ req: context.extra.request })
		},
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
	const apiServer: ApiServer = Object.assign(httpServer, { stop: () => apolloServer.stop() })

	return apiServer
}

async function attachSession(request: http.IncomingMessage, processSession: RequestHandler): Promise<SessionRequest> {
	// express-session only uses Node's response header API here. A real ServerResponse avoids pretending that an empty object is an Express response.
	const response = new http.ServerResponse(request)
	await new Promise<void>((resolve, reject) => {
		try {
			processSession(request as Request, response as Response, error => error ? reject(error) : resolve())
		} catch (error) {
			reject(error)
		}
	})
	ensureSessionRequest(request)
	return request
}

function ensureSessionRequest(request: http.IncomingMessage): asserts request is SessionRequest {
	if (!('session' in request) || typeof request.session !== 'object' || request.session === null) throw new Error('Session middleware did not attach a session to the WebSocket request.')
}
