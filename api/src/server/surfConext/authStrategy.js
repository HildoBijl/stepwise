const { AuthStrategyTemplate } = require('../authHandler')

class AuthStrategy extends AuthStrategyTemplate {
	constructor(database, surfConextClient) {
		super()
		this._db = database
		this._surfConext = surfConextClient
	}

	async authenticate(req) {
		try {
			return await this._surfConext.userinfo(req)
		} catch(e) {
			throw AuthStrategy.INVALID_AUTHENTICATION
		}
	}

	async login(authData) {
		const surfProfile = await this._db.SurfConextProfile.findOne({
			where: { sub: authData.sub }
		})
		if (!surfProfile) {
			throw AuthStrategy.USER_NOT_FOUND
		}
		return surfProfile.userId
	}
}

module.exports = {
	AuthStrategy
}
