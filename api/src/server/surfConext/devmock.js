const { MemoryStore } = require('express-session')
const fileSystem = require('fs')
const USERINFO = require('../../../surfConextMockData.json')

const LAST_SESSION_ID_PATH = __dirname + '/../../../lastSessionId'

const DIRECTORY_PATH = '/_dev/surfconextportal'

class MockClient {
	async authorizationUrl() {
		return DIRECTORY_PATH
	}

	async getData(params, sessionId) {
		const sfUserinfo = USERINFO.find(u => u.sub === params.sub)
		if (!sfUserinfo) {
			return null
		}
		// Persist session id on file system, so that it can be
		// recovered on server restart
		fileSystem.writeFileSync(LAST_SESSION_ID_PATH, sessionId)
		return sfUserinfo
	}
}

const createPrefilledMemoryStore = () => {
	const memoryStore = new MemoryStore()
	if (fileSystem.existsSync(LAST_SESSION_ID_PATH)) {
		const lastSessionId = fileSystem.readFileSync(LAST_SESSION_ID_PATH)
		memoryStore.set(lastSessionId, {
			principal: { id: '01234567-89ab-cdef-0123-456789abcdef' },
			cookie: {},
		})
	}
	return memoryStore
}

const userDirectory = (req, res) => {
	const list = USERINFO.map(u => `<li>
			<a href="/auth/surfconext/login?sub=${u.sub}">
				${u.name} &lt;${u.email}&gt;
			</a>
		</li>
	`)
	res.send(`<!doctype html>
		<html><body>
			<h1>SurfConext Mock Users</h1>
			<ul>${list.join('')}`)
}

module.exports = {
	MockClient, createPrefilledMemoryStore, userDirectory, DIRECTORY_PATH
}
