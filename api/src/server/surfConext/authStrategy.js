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
		const uniMembership = await this._db.UniversityMembership.findOne({
			where: { memberId: authData.sub }
		})
		if (!uniMembership) {
			throw AuthStrategy.USER_NOT_FOUND
		}
		return uniMembership.userId
	}
}

module.exports = {
	AuthStrategy
}
