import { ForbiddenError, InvalidInputError } from '../../../../src/errors.ts'
import type { GroupMemberRecord, GroupWithMembers } from '../../../../src/modules/group/models.ts'
import { createRandomGroupCode, ensureActiveGroupMembership, ensureGroupMembership } from '../../../../src/modules/group/service.ts'

function group(active = true): GroupWithMembers {
	return {
		code: 'ABCD',
		members: [{ id: 'user-id', groupMembership: { active } } as GroupMemberRecord],
	} as GroupWithMembers
}

describe('group service helpers', () => {
	it('accepts members and active members', () => {
		expect(() => ensureGroupMembership(group(), 'user-id')).not.toThrow()
		expect(() => ensureActiveGroupMembership(group(), 'user-id')).not.toThrow()
	})

	it('distinguishes missing groups, non-members, and inactive members', () => {
		expect(() => ensureGroupMembership(null, 'user-id')).toThrow(InvalidInputError)
		expect(() => ensureGroupMembership(group(), 'other-id')).toThrow(ForbiddenError)
		expect(() => ensureActiveGroupMembership(group(false), 'user-id')).toThrow(ForbiddenError)
	})

	it('creates four-character codes from the unambiguous alphabet', () => {
		for (let index = 0; index < 100; index++) expect(createRandomGroupCode()).toMatch(/^[ABCDEFGHJKLMNPQRTUVWXYZ2346789]{4}$/)
	})
})
