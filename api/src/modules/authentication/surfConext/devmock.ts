import fs from 'node:fs'
import path from 'node:path'
import { MemoryStore, type SessionData } from 'express-session'

import type { SurfConextCallbackParams, SurfConextClient, SurfConextIdentity } from './types.ts'

import rawUserInfo from './mockData.json' with { type: 'json' }

export const mockUsers = rawUserInfo as SurfConextIdentity[]
const LAST_SESSION_DATA_PATH = path.join(import.meta.dirname, '../../../../lastSessionData')

export const directoryPath = '/_dev/surfconextportal'

export class MockClient implements SurfConextClient {
	async authorizationUrl(): Promise<string> {
		return directoryPath
	}

	async getData(params: SurfConextCallbackParams, sessionId: string): Promise<SurfConextIdentity | null> {
		const sfUserinfo = mockUsers.find(user => user.sub === params.sub)
		if (!sfUserinfo) return null
		fs.writeFileSync(LAST_SESSION_DATA_PATH, `${sessionId}\n${sfUserinfo.sub}`)
		return sfUserinfo
	}
}

export function createPrefilledMemoryStore(): MemoryStore {
	const memoryStore = new MemoryStore()
	if (fs.existsSync(LAST_SESSION_DATA_PATH)) {
		const [lastSessionId, userSub] = fs.readFileSync(LAST_SESSION_DATA_PATH, 'utf8').split('\n')
		const user = mockUsers.find(candidate => candidate.sub === userSub)
		if (user?.databaseId) memoryStore.set(lastSessionId, { principal: { id: user.databaseId }, cookie: {} } as unknown as SessionData)
	}
	return memoryStore
}

interface HtmlResponse {
	send(body: string): unknown
}

export function userDirectory(_request: unknown, response: HtmlResponse): void {
	const list = mockUsers.map(user => `<li><a href="/auth/surfconext/login?sub=${user.sub}">${user.name} &lt;${user.email}&gt;</a></li>`)
	response.send(`<!doctype html><html><body><h1>SurfConext Mock Users</h1><ul>${list.join('')}</ul>`)
}
