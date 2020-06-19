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
	}

	async instance() {
		if (this._maybeClient) {
			return this._maybeClient
		}
		return Issuer.discover(this._issuerUrl)
			.then(issuer => {
				this._maybeClient = new issuer.Client({
					client_id: this._clientId,
					client_secret: this._secret,
					redirect_uris: [this._redirectUrl],
					response_types: ['code'],
				})
				return this._maybeClient
			})
	}

	async authorizationUrl(sessionId) {
		return this.instance().then(client => client.authorizationUrl({
			scope: 'openid',
			state: hash(sessionId),
		}))
	}

	async userinfo(authCode, authState, sessionId) {
		return this.instance().then(client => client
			.callback(this._redirectUrl, {
				state: authState,
				code: authCode,
			}, {
				state: hash(sessionId)
			})
			.then(tokenSet => client.userinfo(tokenSet))
		)
	}
}

module.exports = {
	Client
}
