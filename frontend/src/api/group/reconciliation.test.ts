import { describe, expect, it } from 'vitest'

import type { GroupRecord } from './records.ts'
import { addGroupToList, reconcileActiveGroup, removeGroupFromList } from './reconciliation.ts'

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

describe('group subscription reconciliation', () => {
	it('clears the current group when that group is deactivated', () => {
		expect(reconcileActiveGroup(createGroup('AAAA', true), createGroup('AAAA', false), 'user-id')).toBeNull()
	})

	it('ignores a late deactivation from the previously active group', () => {
		const currentGroup = createGroup('BBBB', true)
		expect(reconcileActiveGroup(currentGroup, createGroup('AAAA', false), 'user-id')).toBe(currentGroup)
	})

	it('uses a newly activated group regardless of the current group', () => {
		const updatedGroup = createGroup('BBBB', true)
		expect(reconcileActiveGroup(createGroup('AAAA', true), updatedGroup, 'user-id')).toBe(updatedGroup)
	})

	it('adds, replaces, and removes groups without duplicates', () => {
		const original = createGroup('AAAA', true)
		const replacement = createGroup('AAAA', false)
		expect(addGroupToList(replacement, [original])).toEqual([replacement])
		expect(addGroupToList(createGroup('BBBB', false), [original])).toHaveLength(2)
		expect(removeGroupFromList('AAAA', [original])).toEqual([])
	})
})
