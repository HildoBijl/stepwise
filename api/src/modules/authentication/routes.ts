import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express, { type Request, type RequestHandler, type Router } from 'express'

import { type GoogleAuthDatabase, type GoogleClient, AuthStrategy as GoogleAuthStrategy } from './google/index.ts'
import { type SurfConextAuthDatabase, type SurfConextClient, type SurfConextIdentityProvider, AuthStrategy as SurfConextAuthStrategy } from './surfConext/index.ts'

const INVALID_AUTHENTICATION = 'INVALID_AUTHENTICATION'
const INTERNAL_ERROR = 'INTERNAL_ERROR'
const GOOGLE_SIGN_IN_MAX_AGE_MILLIS = 10 * 60 * 1000

interface AuthConfig { homepageUrl: string; sessionSecret: string }
interface AuthenticatedUserReference { id: string }
type AuthenticationDatabase = GoogleAuthDatabase & SurfConextAuthDatabase

type GoogleSignInState = Readonly<{
	nonce: string
	redirect: string | null
	expiresAt: number
	id: string
}>

export function createAuthRouter(config: AuthConfig, db: AuthenticationDatabase, clients: { surfConextClient: SurfConextClient; googleClient: GoogleClient }): Router {
	const router = express.Router()
	router.use(cookieParser())
	router.use(bodyParser.urlencoded({ extended: true }))

	const createSignInHandler = (getUser: (request: Request) => Promise<AuthenticatedUserReference | null>): RequestHandler => async (request, response) => {
		try {
			const user = await getUser(request)
			if (!user) return void response.redirect(`${config.homepageUrl}?error=${INVALID_AUTHENTICATION}`)
			request.session.principal = { id: user.id }
			const redirectPath = config.homepageUrl + (request.session.redirect || '')
			request.session.redirect = null
			response.redirect(redirectPath)
		} catch (error) {
			console.error(error)
			response.redirect(`${config.homepageUrl}?error=${INTERNAL_ERROR}`)
		}
	}

	router.get('/logout', (request, response) => request.session.destroy(() => response.redirect(config.homepageUrl)))

	const surfConext = new SurfConextAuthStrategy(db, clients.surfConextClient)
	router.get('/surfconext/login', createSignInHandler(request => surfConext.authenticateAndSync(request)))
	const createSurfConextInitiateHandler = (identityProvider?: SurfConextIdentityProvider): RequestHandler => async (request, response) => {
		try {
			await regenerateSession(request)
			request.session.initiated = new Date()
			request.session.redirect = getValidRedirect(request.query.redirect)
			const providerUrl = await surfConext.initiate(request.session.id, identityProvider)
			if (!providerUrl) throw new Error('SurfConext did not provide an authorization URL.')
			response.redirect(providerUrl)
		} catch (error) {
			console.error(error)
			response.redirect(`${config.homepageUrl}?error=${INTERNAL_ERROR}`)
		}
	}
	router.get('/surfconext/initiate/hu', createSurfConextInitiateHandler('hu'))
	router.get('/surfconext/initiate/eduid', createSurfConextInitiateHandler('eduid'))
	router.get('/surfconext/initiate', createSurfConextInitiateHandler())

	const google = new GoogleAuthStrategy(db, clients.googleClient)
	router.post('/google/login', createSignInHandler(async request => {
		const signInState = readGoogleSignInState(request.body.state, config.sessionSecret)
		if (!signInState) return null
		const user = await google.authenticateAndSync(request, signInState.nonce)
		if (user) request.session.redirect = signInState.redirect
		return user
	}))
	router.get('/google/initiate', (request, response) => {
		try {
			const signInState: GoogleSignInState = {
				nonce: randomBytes(32).toString('base64url'),
				redirect: getValidRedirect(request.query.redirect),
				expiresAt: Date.now() + GOOGLE_SIGN_IN_MAX_AGE_MILLIS,
				id: randomBytes(16).toString('base64url'),
			}
			response.json({ state: createGoogleSignInState(signInState, config.sessionSecret), nonce: signInState.nonce })
		} catch (error) {
			console.error(error)
			response.redirect(`${config.homepageUrl}?error=${INTERNAL_ERROR}`)
		}
	})
	return router
}

function getValidRedirect(redirect: unknown): string | null {
	return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : null
}

function regenerateSession(request: Request): Promise<void> {
	return new Promise((resolve, reject) => request.session.regenerate(error => error ? reject(error) : resolve()))
}

function createGoogleSignInState(state: GoogleSignInState, secret: string): string {
	const payload = Buffer.from(JSON.stringify(state)).toString('base64url')
	return `${payload}.${signGoogleState(payload, secret).toString('base64url')}`
}

function readGoogleSignInState(value: unknown, secret: string): GoogleSignInState | null {
	if (typeof value !== 'string') return null
	const [payload, encodedSignature, ...extraParts] = value.split('.')
	if (!payload || !encodedSignature || extraParts.length > 0) return null

	let signature: Buffer
	try {
		signature = Buffer.from(encodedSignature, 'base64url')
	} catch {
		return null
	}
	const expectedSignature = signGoogleState(payload, secret)
	if (signature.length !== expectedSignature.length || !timingSafeEqual(signature, expectedSignature)) return null

	try {
		const state: unknown = JSON.parse(Buffer.from(payload, 'base64url').toString())
		if (!isGoogleSignInState(state) || state.expiresAt < Date.now()) return null
		return state
	} catch {
		return null
	}
}

function signGoogleState(payload: string, secret: string): Buffer {
	return createHmac('sha256', secret).update(payload).digest()
}

function isGoogleSignInState(value: unknown): value is GoogleSignInState {
	if (typeof value !== 'object' || value === null) return false
	const state = value as Partial<GoogleSignInState>
	return typeof state.nonce === 'string' && state.nonce.length > 0
		&& (state.redirect === null || typeof state.redirect === 'string')
		&& typeof state.expiresAt === 'number' && Number.isFinite(state.expiresAt)
		&& typeof state.id === 'string' && state.id.length > 0
}
