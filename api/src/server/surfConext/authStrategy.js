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
			return await this._surfConext.userinfo(req)
		} catch(e) {
			throw AuthStrategy.INVALID_AUTHENTICATION
		}
	}

	async findUser(authData) {
		const surfProfile = await this._db.SurfConextProfile.findOne({
			where: { sub: authData.sub },
			include: {
				model: this._db.User,
			},
		})
		if (!surfProfile || !surfProfile.user) {
			throw AuthStrategy.USER_NOT_FOUND
		}
		return surfProfile.user
	}

	async findOrCreateUser(authData) {
		try {
			const user = await this.findUser(authData)
			return user
		} catch(e) {}
		// TODO use transaction here
		const newUser = await this._db.User.create({
			name: authData.name,
			email: authData.email,
		})
		await this._db.SurfConextProfile.create({
			sub: authData.sub,
			userId: newUser.id,
		})
		return newUser
	}
}

module.exports = {
	AuthStrategy
}
