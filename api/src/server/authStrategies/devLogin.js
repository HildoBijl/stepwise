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
		const uniMembership = await this._db.UniversityMembership.findOne({
			where: { memberId: userId }
		})
		if (!uniMembership) {
			throw AuthStrategy.USER_NOT_FOUND
		}
		// HACK: set session-id to the prefilled one, otherwise
		// a new, random id would be created
		req.sessionID = syntheticSessionId
		return req.query.id
	}
}

module.exports = {
	AuthStrategy, createPrefilledMemoryStore
}
