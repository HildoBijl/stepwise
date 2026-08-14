import { OAuth2Client } from 'google-auth-library'

import type { GoogleAuthData, GoogleClient, GoogleIdentity } from './types.js'

export class Client implements GoogleClient {
	private readonly clientId: string
	private readonly client: OAuth2Client

	constructor(clientId: string) {
		this.clientId = clientId
		this.client = new OAuth2Client(clientId)
	}

	// Verifies the callback request from Google after the user has logged in. Returns Google's identity payload when verification succeeds, or null when authentication fails.
	async getData(authData: GoogleAuthData, csrfToken?: string): Promise<GoogleIdentity | null> {
		// Google puts the same CSRF token in a cookie and callback form field. Check if it matches.
		if (authData.g_csrf_token !== csrfToken) return null

		// Obtain the payload.
		const ticket = await this.client.verifyIdToken({ idToken: authData.credential, audience: this.clientId })
		const payload = ticket.getPayload()

		// A payload is not an authenticated identity. Only accept email addresses that Google has verified.
		if (!payload?.email_verified) return null
		return payload
	}
}
