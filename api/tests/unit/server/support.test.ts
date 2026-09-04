import { describe, expect, it } from 'vitest'

import type { RequestWithSession } from '../../../src/server/types.ts'
import { getSessionUserId } from '../../../src/server/support.ts'

function requestWithSession(session: unknown): RequestWithSession {
	return { session } as RequestWithSession
}

describe('getSessionUserId', () => {
	it('returns the principal ID', () => {
		expect(getSessionUserId(requestWithSession({ principal: { id: 'user-id' } }))).toBe('user-id')
	})

	it.each([undefined, {}, { principal: {} }])('returns undefined when the session has no principal ID', session => {
		expect(getSessionUserId(requestWithSession(session))).toBeUndefined()
	})
})
