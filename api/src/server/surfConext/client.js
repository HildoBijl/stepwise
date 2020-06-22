const { Issuer } = require('openid-client')
const crypto = require('crypto')

const hash = text => crypto.createHash('sha256').update(text).digest('hex')

class Client {
	constructor(issuerUrl, redirectUrl, clientId, secret) {
		this._issuerUrl = issuerUrl
		this._redirectUrl = redirectUrl
		this._clientId = clientId
		this._secret = secret
		this._maybeClient = null
		// Cache issuer configuration for 24h
		this._clientExpiresAt = new Date()
	}

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

module.exports = {
	Client
}
