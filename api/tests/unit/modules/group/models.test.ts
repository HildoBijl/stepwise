import { describe, expect, it } from 'vitest'

import { hasLoadedGroupMembers, hasLoadedUserGroups } from '../../../../src/modules/group/models.ts'
import type { GroupRecord } from '../../../../src/modules/group/index.ts'
import type { UserRecord } from '../../../../src/modules/user/index.ts'

describe('group model guards', () => {
	it.each([
		[[], true],
		[[{}], true],
		[undefined, false],
	])('detects loaded group members', (members, expected) => {
		expect(hasLoadedGroupMembers({ members } as unknown as GroupRecord)).toBe(expected)
	})

	it.each([
		[[], true],
		[[{}], true],
		[undefined, false],
		[{}, false],
	])('detects loaded user groups', (groups, expected) => {
		expect(hasLoadedUserGroups({ groups } as unknown as UserRecord)).toBe(expected)
	})
})
