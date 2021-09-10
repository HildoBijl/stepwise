class AuthStrategy {
	constructor(database, surfConextClient) {
		this._db = database
		this._surfConextClient = surfConextClient
	}

	/**
	 * Initiates authentication with SurfConext by generating a redirect URL.
	 * @returns Promise<string> Redirect URL
	 */
	async initiate(sessionId) {
		return await this._surfConextClient
			.authorizationUrl(sessionId)
	}

	/**
	 * Authenticates the a request from the client against SurfConext
	 * and syncs it to the database. Returns user on success, otherwise `null`.
	 * @param req HTTP request
	 * @returns Promise<User|null> SurfConext user information
	 */
	async authenticateAndSync(req) {
		const surfRawData = await this._surfConextClient
			.getData(req.query, req.session.id)
		if (!surfRawData) {
			return null
		}

		if (!surfRawData.email) {
			return null
		}

		// Try to find the user via their SurfConext profile. SurfConext guarantees
		// that the `sub` property is unique and permanent for every person, so
		// we rely on that to identify the user in our system.
		const surfProfile = await this._db.SurfConextProfile.findOne({
			where: { id: surfRawData.sub },
			include: {
				model: this._db.User,
			},
		})
		let userId = surfProfile ? surfProfile.user.id : undefined

		// If we can’t find a user by their SurfProfile, we fallback to looking for
		// their email address, because maybe they had created their account in
		// another way, e.g. via Google Login.
		if (!userId) {
			const userWithoutSurfProfile = await this._db.User.findOne({
				where: { email: surfRawData.email },
			})
			userId = userWithoutSurfProfile ? userWithoutSurfProfile.id : undefined
		}

		// Update the data if the user already exists, otherwise create a new account.
		// We trust SurfConext to always have correct data, so we just overwrite all
		// user information with what we get from SurfConext.
		return await this._db.transaction(async t => {
			const [user] = await this._db.User.upsert({
				id: userId || undefined,
				name: surfRawData.name || undefined,
				givenName: surfRawData.given_name || undefined,
				familyName: surfRawData.family_name || undefined,
				email: surfRawData.email || undefined,
				role: getRole(surfRawData),
			}, { returning: true, transaction: t })
			await this._db.SurfConextProfile.upsert({
				id: surfRawData.sub,
				userId: user.id,
				schacHomeOrganization: surfRawData.schac_home_organization,
				schacPersonalUniqueCode: surfRawData.schac_personal_unique_code,
				locale: surfRawData.locale,
			}, { transaction: t })
			return user
		})
	}
}

function getRole(surfRawData) {
	const affiliation = surfRawData.eduperson_affiliation
	if (Array.isArray(affiliation) && affiliation.includes('teacher')) {
		return 'teacher'
	}
	return undefined // use default
}

module.exports = {
	AuthStrategy
}
