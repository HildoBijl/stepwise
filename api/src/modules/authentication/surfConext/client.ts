import crypto from 'node:crypto'
import { type Configuration, authorizationCodeGrant, buildAuthorizationUrl, discovery, fetchUserInfo } from 'openid-client'

import { type SurfConextCallbackParams, type SurfConextClient, type SurfConextIdentity, type SurfConextIdentityProvider, type SurfConextIdentityProviderHints, isSurfConextIdentity } from './types.ts'

function hash(text: string): string {
	return crypto.createHash('sha256').update(text).digest('hex')
}

export class Client implements SurfConextClient {
	private readonly _issuerUrl: string
	private readonly _redirectUrl: string
	private readonly _clientId: string
	private readonly _secret: string
	private readonly _identityProviderHints: SurfConextIdentityProviderHints
	private _maybeConfiguration: Configuration | null = null
	private _configurationExpiresAt = new Date()

	constructor(issuerUrl: string, redirectUrl: string, clientId: string, secret: string, identityProviderHints: SurfConextIdentityProviderHints) {
		this._issuerUrl = issuerUrl
		this._redirectUrl = redirectUrl
		this._clientId = clientId
		this._secret = secret
		this._identityProviderHints = identityProviderHints
	}

	async authorizationUrl(sessionId: string, identityProvider?: SurfConextIdentityProvider): Promise<string | null> {
		try {
			const configuration = await this._configuration()
			if (!configuration) return null
			return buildAuthorizationUrl(configuration, {
				redirect_uri: this._redirectUrl,
				scope: 'openid',
				state: hash(sessionId),
				...(identityProvider ? { login_hint: this._identityProviderHints[identityProvider] } : {}),
			}).href
		} catch (error) {
			console.error(error)
			return null
		}
	}

	async getIdentity(params: SurfConextCallbackParams, sessionId: string): Promise<SurfConextIdentity | null> {
		if (typeof params.state !== 'string' || typeof params.code !== 'string') return null

		try {
			const configuration = await this._configuration()
			if (!configuration) return null
			const callbackUrl = new URL(this._redirectUrl)
			callbackUrl.searchParams.set('state', params.state)
			callbackUrl.searchParams.set('code', params.code)
			const tokens = await authorizationCodeGrant(configuration, callbackUrl, {
				expectedState: hash(sessionId),
				idTokenExpected: true,
			})
			const subject = tokens.claims()?.sub
			if (typeof tokens.access_token !== 'string' || typeof subject !== 'string') return null
			const userInfo = await fetchUserInfo(configuration, tokens.access_token, subject)
			return isSurfConextIdentity(userInfo) ? userInfo : null
		} catch {
			return null
		}
	}

	private async _configuration(): Promise<Configuration | null> {
		if (!this._maybeConfiguration || this._configurationExpiresAt < new Date()) {
			try {
				this._maybeConfiguration = await discovery(new URL(this._issuerUrl), this._clientId, {
					client_secret: this._secret,
					redirect_uris: [this._redirectUrl],
					response_types: ['code'],
				})
				const expiresAt = new Date()
				expiresAt.setDate(expiresAt.getDate() + 1)
				this._configurationExpiresAt = expiresAt
			} catch (error) {
				console.error(error)
				return null
			}
		}
		return this._maybeConfiguration
	}
}
