import fs from 'node:fs'
import path from 'node:path'
import { MemoryStore, type SessionData } from 'express-session'

import type { SurfConextCallbackParams, SurfConextClient, SurfConextIdentity } from './types'

import rawUserInfo from './mockData.json'

export const SURF_CONEXT_MOCK_USERS = rawUserInfo as SurfConextIdentity[]
const LAST_SESSION_DATA_PATH = path.join(__dirname, '../../../../lastSessionData')

export const DIRECTORY_PATH = '/_dev/surfconextportal'

export class MockClient implements SurfConextClient {
	async authorizationUrl(): Promise<string> {
		return DIRECTORY_PATH
	}

	async getData(params: SurfConextCallbackParams, sessionId: string): Promise<SurfConextIdentity | null> {
		const sfUserinfo = SURF_CONEXT_MOCK_USERS.find(user => user.sub === params.sub)
		if (!sfUserinfo) return null
		fs.writeFileSync(LAST_SESSION_DATA_PATH, `${sessionId}\n${sfUserinfo.sub}`)
		return sfUserinfo
	}
}

export const createPrefilledMemoryStore = (): MemoryStore => {
	const memoryStore = new MemoryStore()
	if (fs.existsSync(LAST_SESSION_DATA_PATH)) {
		const [lastSessionId, userSub] = fs.readFileSync(LAST_SESSION_DATA_PATH, 'utf8').split('\n')
		const user = SURF_CONEXT_MOCK_USERS.find(candidate => candidate.sub === userSub)
		if (user?.databaseId) memoryStore.set(lastSessionId, { principal: { id: user.databaseId }, cookie: {} } as unknown as SessionData)
	}
	return memoryStore
}

interface HtmlResponse {
	send(body: string): unknown
}

export const userDirectory = (_request: unknown, response: HtmlResponse): void => {
	const list = SURF_CONEXT_MOCK_USERS.map(user => `<li><a href="/auth/surfconext/login?sub=${user.sub}">${user.name} &lt;${user.email}&gt;</a></li>`)
	response.send(`<!doctype html><html><body><h1>SurfConext Mock Users</h1><ul>${list.join('')}</ul>`)
}
