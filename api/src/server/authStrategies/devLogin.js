const { MemoryStore } = require('express-session')

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

const authStrategy = async (req) => {
	const syntheticSessionId = syntheticSessionIdsByUser[req.query.id]
	if (!syntheticSessionId) {
		return null
	}
	// HACK: overwrite session-id to the prefilled one
	req.sessionID = syntheticSessionId
	return {
		memberId: req.query.id,
	}
}

module.exports = {
	authStrategy, createPrefilledMemoryStore
}
