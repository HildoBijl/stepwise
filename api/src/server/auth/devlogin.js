const router = require('express').Router()
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

const createMemoryStore = () => {
	const ms = new MemoryStore()
	for (let [userId, sessId] of Object.entries(syntheticSessionIdsByUser)) {
		ms.set(sessId, {
			principal: { id: userId },
			cookie: {},
		})
	}
	return ms
}

router.get('/', async (req, res) => {
	const syntheticSessionId = syntheticSessionIdsByUser[req.query.id]
	if (!syntheticSessionId) {
		// Only allow to login whitelisted users.
		res.status(403)
		res.send('Illegal dev user!')
		return
	}
	req.sessionID = syntheticSessionId
	req.session.initiated = new Date()
	res.send("OK")
})

module.exports = {
	router, createMemoryStore
}
