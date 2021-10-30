import { MemoryStore } from 'express-session'
import fileSystem from 'fs'
import USERINFO from '../../../surfConextMockData.json'

const LAST_SESSION_ID_PATH = new URL('.', import.meta.url).pathname.replace(/(^\/|\/$)/g, '') + '/../../../lastSessionId'

export const DIRECTORY_PATH = '/_dev/surfconextportal'

export class MockClient {
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

export const createPrefilledMemoryStore = () => {
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

export const userDirectory = (req, res) => {
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
