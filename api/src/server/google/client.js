const { OAuth2Client } = require('google-auth-library')

class Client {
	constructor(clientId) {
		this._clientId = clientId
		this._client = new OAuth2Client(this._clientId)
	}

	/**
	 * Verifies the callback request from Google, after the user has
	 * logged in there.
	 * If the verification was successful, it returns the raw user information
	 * from Google. Otherwise it returns null, which means the user is not
	 * authenticated.
	 * @param authData The request body data from the Google callback request.
	 * @param csrfToken The CSRF token as obtained from the `g_csrf_token` cookie.
	 */
	async getData(authData, csrfToken) {
		// Verify token and fetch ticket data.
		const ticket = await this._client.verifyIdToken({
			idToken: authData.credential,
			audience: this._clientId,
		})

		const payload = ticket.getPayload()

		// Only accept users whose email address has been verified by Google.
		if (!payload.email_verified) {
			return null
		}

		return payload
	}
}

module.exports = {
	Client,
}
