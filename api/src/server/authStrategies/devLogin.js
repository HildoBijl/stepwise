const { MemoryStore } = require('express-session')
const { AuthStrategyInterface } = require('../authHandler')

// The following user-ids can be logged in via the devlogin:
const DEV_USER_WHITELIST = [
	'00000000-0000-0000-0000-000000000000',
]

const syntheticSessionIdsByUser = DEV_USER_WHITELIST.reduce((dict, userId, i) => {
	const syntheticSessionId = '0'.repeat(32).concat(i).slice(-32)
	dict[userId] = syntheticSessionId
	return dict
}, {})

const createPrefilledMemoryStore = () => {
	const ms = new MemoryStore()
	for (const [userId, sessId] of Object.entries(syntheticSessionIdsByUser)) {
		ms.set(sessId, {
			principal: { id: userId },
			cookie: {},
		})
	}
	return ms
}

class AuthStrategy extends AuthStrategyInterface {
	constructor(database) {
		super()
		this._db = database
	}

	async authenticate(req) {
		const userId = req.query.id
		const syntheticSessionId = syntheticSessionIdsByUser[userId]
		if (!syntheticSessionId) {
			throw AuthStrategy.INVALID_AUTHENTICATION
		}
		return {
			userId,
			forceSessionStart: () => req.sessionID = syntheticSessionId,
		}
	}

	async login(authData) {
		const user = await this._db.User.findByPk(authData.userId)
		if (!user) {
			throw AuthStrategy.USER_NOT_FOUND
		}
		authData.forceSessionStart()
		return user.id
	}
}

module.exports = {
	AuthStrategy, createPrefilledMemoryStore
}
