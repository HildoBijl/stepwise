import type { GroupRecord } from './records.ts'

export function addGroupToList(newGroup: GroupRecord, groups: readonly GroupRecord[] = []): GroupRecord[] {
	if (groups.some(group => group.code === newGroup.code)) return groups.map(group => group.code === newGroup.code ? newGroup : group)
	return [...groups, newGroup]
}

export function removeGroupFromList(code: string, groups: readonly GroupRecord[] = []): GroupRecord[] {
	const result = groups.filter(group => group.code !== code)
	return result.length === groups.length ? [...groups] : result
}

export function reconcileActiveGroup(currentGroup: GroupRecord | null, updatedGroup: GroupRecord, userId: string | undefined): GroupRecord | null {
	const member = updatedGroup.members.find(member => member.userId === userId)
	if (member?.active) return updatedGroup
	if (currentGroup && currentGroup.code !== updatedGroup.code) return currentGroup
	return null
}
