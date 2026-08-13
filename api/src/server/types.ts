import type { RequestHandler } from 'express'
import type { Store } from 'express-session'
import type { PubSubEngine } from 'graphql-subscriptions'

import type { ServerConfig } from '../config'
import type { Database } from '../database'
import type { GoogleClient } from '../modules/authentication/google'
import type { SurfConextClient } from '../modules/authentication/surfConext'

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
