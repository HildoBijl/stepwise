import { describe, expect, it } from 'vitest'

import type { GroupRecord } from './records.ts'
import { groupRecordToGroup } from './conversion.ts'

const groupRecord: GroupRecord = {
	__typename: 'Group',
	code: 'ABCD',
	members: [{
		groupId: 'group-id',
		userId: 'user-id',
		name: null,
		givenName: 'Alex',
		familyName: null,
		active: true,
		lastActivity: '2026-01-01T00:00:00.000Z',
	}],
}

describe('group API conversion', () => {
	it('converts member dates and omits nullable names', () => {
		const group = groupRecordToGroup(groupRecord)
		expect(group.members[0]).toEqual({
			groupId: 'group-id',
			userId: 'user-id',
			givenName: 'Alex',
			active: true,
			lastActivity: new Date('2026-01-01T00:00:00.000Z'),
		})
	})
})
