import { describe, expect, it } from 'vitest'

import type { GroupRecord } from './records.ts'
import { removeGroupRecord, upsertGroupRecord } from './recordLists.ts'

function createGroup(code: string, active: boolean): GroupRecord {
	return {
		__typename: 'Group',
		code,
		members: [{
			groupId: `${code}-id`,
			userId: 'user-id',
			name: null,
			givenName: null,
			familyName: null,
			active,
			lastActivity: '2026-01-01T00:00:00.000Z',
		}],
	}
}

describe('group record-list updates', () => {
	it('replaces a group with the same code', () => {
		const original = createGroup('AAAA', true)
		const replacement = createGroup('AAAA', false)
		expect(upsertGroupRecord(replacement, [original])).toEqual([replacement])
	})

	it('adds a group with a new code', () => {
		const original = createGroup('AAAA', true)
		const newGroup = createGroup('BBBB', false)
		expect(upsertGroupRecord(newGroup, [original])).toEqual([original, newGroup])
	})

	it('removes a group by code', () => {
		const original = createGroup('AAAA', true)
		expect(removeGroupRecord('AAAA', [original])).toEqual([])
	})
})
