import type { GroupMemberRecord, GroupRecord } from '../models.ts'

export const groupFieldResolvers = {
	Group: {
		members: (group: GroupRecord) => group.members ?? group.getMembers(),
	},

	GroupMember: {
		groupId: (member: GroupMemberRecord) => member.groupMembership.groupId,
		userId: (member: GroupMemberRecord) => member.id,
		active: (member: GroupMemberRecord) => member.groupMembership.active,
		lastActivity: (member: GroupMemberRecord) => member.groupMembership.updatedAt,
	},
}
