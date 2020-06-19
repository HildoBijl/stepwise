const { MemoryStore } = require('express-session')
const USERINFO = require('../../../surfConextMockData.json')

const PRELOGGEDIN_USER = {
	// User-ID as in our system:
	USER_ID: '00000000-0000-0000-0000-000000000000',
	// Sub-field from SurfConext
	SUB_ID: '00000000-0000-0000-0000-000000000000',
	// Static session id
	SESSION_ID: '00000000000000000000000000000000',
}

class MockClient {
	async authorizationUrl() {
		return `/auth/surfconext/login?sub=${PRELOGGEDIN_USER.SUB_ID}`
	}

	async userinfo(req) {
		const sfUserinfo = USERINFO.find(u => u.sub === req.query.sub)
		if (!sfUserinfo) {
			throw new Error('User not found')
		}
		if (sfUserinfo.sub === PRELOGGEDIN_USER.SUB_ID) {
			req.sessionID = PRELOGGEDIN_USER.SESSION_ID
		}
		return sfUserinfo
	}
}

const createPrefilledMemoryStore = () => {
	const ms = new MemoryStore()
	ms.set(PRELOGGEDIN_USER.SESSION_ID, {
		principal: { id: PRELOGGEDIN_USER.USER_ID },
		cookie: {},
	})
	return ms
}

module.exports = {
	MockClient, createPrefilledMemoryStore
}
