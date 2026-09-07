import type { GroupRecord } from './records.ts'

export function addGroupRecordToList(newGroup: GroupRecord, groups: readonly GroupRecord[] = []): GroupRecord[] {
	if (groups.some(group => group.code === newGroup.code)) return groups.map(group => group.code === newGroup.code ? newGroup : group)
	return [...groups, newGroup]
}

export function removeGroupRecordFromList(code: string, groups: readonly GroupRecord[] = []): GroupRecord[] {
	const result = groups.filter(group => group.code !== code)
	return result.length === groups.length ? [...groups] : result
}
