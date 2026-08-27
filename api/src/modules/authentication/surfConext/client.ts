import crypto from 'node:crypto'
import { Client as OpenIdClient, Issuer } from 'openid-client'

import { type SurfConextCallbackParams, type SurfConextClient, type SurfConextIdentity, isSurfConextIdentity } from './types.ts'

function hash(text: string): string {
	return crypto.createHash('sha256').update(text).digest('hex')
}

export class Client implements SurfConextClient {
	private readonly _issuerUrl: string
	private readonly _redirectUrl: string
	private readonly _clientId: string
	private readonly _secret: string
	private _maybeClient: OpenIdClient | null = null
	private _clientExpiresAt = new Date()

	constructor(issuerUrl: string, redirectUrl: string, clientId: string, secret: string) {
		this._issuerUrl = issuerUrl
		this._redirectUrl = redirectUrl
		this._clientId = clientId
		this._secret = secret
	}

	async authorizationUrl(sessionId: string): Promise<string | null> {
		try {
			const client = await this._instance()
			return client?.authorizationUrl({ scope: 'openid', state: hash(sessionId) }) ?? null
		} catch (error) {
			console.error(error)
			return null
		}
	}

	async getData(params: SurfConextCallbackParams, sessionId: string): Promise<SurfConextIdentity | null> {
		if (typeof params.state !== 'string' || typeof params.code !== 'string') return null

		try {
			const client = await this._instance()
			if (!client) return null
			const tokenSet = await client.callback(this._redirectUrl, { state: params.state, code: params.code }, { state: hash(sessionId) })
			const userInfo = await client.userinfo(tokenSet)
			return isSurfConextIdentity(userInfo) ? userInfo : null
		} catch {
			return null
		}
	}

	private async _instance(): Promise<OpenIdClient | null> {
		if (!this._maybeClient || this._clientExpiresAt < new Date()) {
			try {
				const issuer = await Issuer.discover(this._issuerUrl)
				this._maybeClient = new issuer.Client({
					client_id: this._clientId,
					client_secret: this._secret,
					redirect_uris: [this._redirectUrl],
					response_types: ['code'],
				})
				const expiresAt = new Date()
				expiresAt.setDate(expiresAt.getDate() + 1)
				this._clientExpiresAt = expiresAt
			} catch (error) {
				console.error(error)
				return null
			}
		}
		return this._maybeClient
	}
}
