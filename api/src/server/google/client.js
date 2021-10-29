import { OAuth2Client } from 'google-auth-library'

export default class Client {
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
		// Before starting the authentication flow, Google sets a cookie with a
		// CSRF token. The same token value is included in the authData of the
		// callback request, and we must make sure that both match up.
		const expectedCsrfToken = authData['g_csrf_token']
		if (expectedCsrfToken !== csrfToken) {
			return null
		}

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
