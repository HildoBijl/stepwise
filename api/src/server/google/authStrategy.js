export default class AuthStrategy {
	constructor(database, googleClient) {
		this._db = database
		this._googleClient = googleClient
	}

	async authenticateAndSync(req) {
		const authData = req.body
		const csrfToken = req.cookies['g_csrf_token']
		const googleRawData = await this._googleClient.getData(authData, csrfToken)
		if (!googleRawData) {
			return null
		}

		if (!googleRawData.email) {
			return null
		}

		// If the user logs in via Google, we just try to find them by their
		// email address. For simplicity, we don’t store a dedicated authentication
		// profile like with SurfConext.
		const existingUser = await this._db.User.findOne({
			where: { email: googleRawData.email },
		})

		// In contrast to the SurfConext login, we don’t update user data when
		// logging in via Google, because the information might not be identical.
		// SurfConext should always take precedence, though.
		if (existingUser) {
			return existingUser
		}

		// If the user doesn’t exist, we create them.
		return await this._db.User.create({
			id: undefined, // auto-generate
			name: googleRawData.name,
			givenName: googleRawData.given_name,
			familyName: googleRawData.family_name,
			email: googleRawData.email,
			role: undefined,
		})
	}
}
