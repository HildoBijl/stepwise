import type { IncomingMessage, Server as HttpServer } from 'node:http'
import type { Request, RequestHandler } from 'express'
import type { Store } from 'express-session'
import type { PubSubEngine } from 'graphql-subscriptions'

import type { Database } from '../database.ts'
import type { GoogleClient } from '../modules/authentication/google/index.ts'
import type { SurfConextClient } from '../modules/authentication/surfConext/index.ts'

export type RequestWithSession = Pick<Request, 'session'>
export type SessionRequest = IncomingMessage & RequestWithSession
export type ApiServer = HttpServer & { stop(): Promise<void> }

export type ServerConfig = Readonly<{
	sslEnabled: boolean
	sessionSecret: string
	sessionMaxAgeMillis: number
	homepageUrl: string
	apiDomain: string
	corsUrls?: string[]
}>

export type ApiConfig = Readonly<{
	port: number
	isProduction: boolean
	isDevelopment: boolean
	server: ServerConfig
}>

export interface DevAuthPortal {
	path: string
	directory: RequestHandler
}

export interface CreateServerOptions {
	config: ServerConfig
	database: Database
	sessionStore?: Store
	surfConextClient: SurfConextClient
	googleClient: GoogleClient
	pubsub: PubSubEngine
	useI18n?: boolean
	devAuthPortal?: DevAuthPortal | null
}
