import { describe, expect, it } from 'vitest'

import type { GroupRecord } from '../records.ts'
import { reconcileActiveGroupRecord } from './useMyActiveGroupSubscription.ts'

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

describe('active-group subscription reconciliation', () => {
	it('clears the current group when that group is deactivated', () => {
		expect(reconcileActiveGroupRecord(createGroup('AAAA', true), createGroup('AAAA', false), 'user-id')).toBeNull()
	})

	it('ignores a late deactivation from the previously active group', () => {
		const currentGroup = createGroup('BBBB', true)
		expect(reconcileActiveGroupRecord(currentGroup, createGroup('AAAA', false), 'user-id')).toBe(currentGroup)
	})

	it('uses a newly activated group regardless of the current group', () => {
		const updatedGroup = createGroup('BBBB', true)
		expect(reconcileActiveGroupRecord(createGroup('AAAA', true), updatedGroup, 'user-id')).toBe(updatedGroup)
	})
})
