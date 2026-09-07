export type GroupMemberRecord = {
	groupId: string
	userId: string
	name: string | null
	givenName: string | null
	familyName: string | null
	active: boolean
	lastActivity: string
}

export type GroupRecord = {
	__typename: 'Group'
	code: string
	members: GroupMemberRecord[]
}