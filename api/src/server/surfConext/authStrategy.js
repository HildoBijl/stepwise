const { AuthStrategyTemplate } = require('../authHandler')

class AuthStrategy extends AuthStrategyTemplate {
	constructor(database, surfConextClient) {
		super()
		this._db = database
		this._surfConext = surfConextClient
	}

	async initiate(sessionId) {
		return await this._surfConext.authorizationUrl(sessionId)
	}

	async authenticate(req) {
		try {
			return await this._surfConext.userinfo(req.query, req.session.id)
		} catch(e) {
			throw AuthStrategy.INVALID_AUTHENTICATION
		}
	}

	async findOrCreateUser(authData) {
		const surfProfile = await this._db.SurfConextProfile.findOne({
			where: { sub: authData.sub },
			include: {
				model: this._db.User,
			},
		})
		// TODO use transactions
		const [user] = await this._db.User.upsert({
			// Update if user exists, otherwise a new one gets created
			id: surfProfile ? surfProfile.user.id : undefined,
			name: authData.name,
			email: authData.email,
		}, { returning: true })
		await this._db.SurfConextProfile.upsert({
			sub: authData.sub,
			userId: user.id,
			schacHomeOrganization: authData.schac_home_organization,
		})
		return user
	}
}

module.exports = {
	AuthStrategy
}
