import { Issuer } from 'openid-client'
import crypto from 'crypto'

const hash = text => crypto.createHash('sha256').update(text).digest('hex')

export default class Client {
	constructor(issuerUrl, redirectUrl, clientId, secret) {
		this._issuerUrl = issuerUrl
		this._redirectUrl = redirectUrl
		this._clientId = clientId
		this._secret = secret
		this._maybeClient = null
		this._clientExpiresAt = new Date()
	}

	/**
	 * Generate the SurfConext URL that we send the user to.
	 * @param sessionId The current session id of the (anonymous) user.
	 */
	async authorizationUrl(sessionId) {
		try {
			const client = await this._instance()
			return client.authorizationUrl({
				scope: 'openid',
				state: hash(sessionId),
			})
		} catch(e) {
			console.log(e)
			return null
		}
	}

	/**
	 * Verifies the callback request from SurfConext, after the user has
	 * logged in there.
	 * If the verification was successful, it returns the raw user information
	 * from SurfConext. Otherwise it returns null, which means the user is not
	 * authenticated.
	 * @param params URL query parameters as given from SurfConext Portal.
	 * @param sessionId The session ID with which the user had initiated the flow.
	 */
	async getData(params, sessionId) {
		try {
			const client = await this._instance()
			const tokenSet = await client
				.callback(this._redirectUrl, {
					state: params.state,
					code: params.code,
				}, {
					state: hash(sessionId)
				})
			return await client.userinfo(tokenSet)
		} catch(e) {
			return null
		}
	}

	/**
	 * Returns an instance of the client. This is automatically refreshed
	 * after 24h, because of occasional certificate rotation.
	 */
	async _instance() {
		if (!this._maybeClient || this._clientExpiresAt < new Date()) {
			try {
				// Autodiscover Issuer configuration
				const issuer = await Issuer.discover(this._issuerUrl)
				this._maybeClient = new issuer.Client({
					client_id: this._clientId,
					client_secret: this._secret,
					redirect_uris: [this._redirectUrl],
					response_types: ['code'],
				})
				this._clientExpiresAt = (() => {
					const d = new Date()
					// Set to 24h in advance
					d.setDate(new Date().getDate() + 1)
					return d
				})()
			} catch (e) {
				console.log(e)
				return null
			}
		}
		return this._maybeClient
	}
}
