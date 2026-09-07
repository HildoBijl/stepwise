import { describe, expect, it } from 'vitest'

import type { GroupRecord } from './records.ts'
import { addGroupRecordToList, removeGroupRecordFromList } from './recordLists.ts'

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
	it('adds, replaces, and removes groups without duplicates', () => {
		const original = createGroup('AAAA', true)
		const replacement = createGroup('AAAA', false)
		expect(addGroupRecordToList(replacement, [original])).toEqual([replacement])
		expect(addGroupRecordToList(createGroup('BBBB', false), [original])).toHaveLength(2)
		expect(removeGroupRecordFromList('AAAA', [original])).toEqual([])
	})
})
