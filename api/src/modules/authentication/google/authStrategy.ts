import type { GoogleAuthDatabase, GoogleAuthRequest, GoogleClient, AuthenticatedUser } from './types.ts'

export class AuthStrategy {
	constructor(private readonly database: GoogleAuthDatabase, private readonly googleClient: GoogleClient) { }

	async authenticateAndSync(request: GoogleAuthRequest): Promise<AuthenticatedUser | null> {
		const authData = request.body
		const csrfToken = request.cookies.g_csrf_token
		const googleIdentity = await this.googleClient.getData(authData, csrfToken)
		if (!googleIdentity?.email) return null

		// Google users are matched by email. SurfConext remains authoritative, so an existing user's profile is not updated from Google data.
		const existingUser = await this.database.User.findOne({ where: { email: googleIdentity.email } })
		if (existingUser) return existingUser
		return this.database.User.create({
			name: googleIdentity.name ?? null,
			givenName: googleIdentity.given_name ?? null,
			familyName: googleIdentity.family_name ?? null,
			email: googleIdentity.email,
		})
	}
}
