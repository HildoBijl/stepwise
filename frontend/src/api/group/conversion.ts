import type { Group, GroupMember } from './types.ts'
import type { GroupMemberRecord, GroupRecord } from './records.ts'

export function groupMemberRecordToMember(record: GroupMemberRecord): GroupMember {
	return {
		groupId: record.groupId,
		userId: record.userId,
		...(record.name === null ? {} : { name: record.name }),
		...(record.givenName === null ? {} : { givenName: record.givenName }),
		...(record.familyName === null ? {} : { familyName: record.familyName }),
		active: record.active,
		lastActivity: new Date(record.lastActivity),
	}
}

export function groupRecordToGroup(record: GroupRecord): Group {
	return { code: record.code, members: record.members.map(groupMemberRecordToMember) }
}