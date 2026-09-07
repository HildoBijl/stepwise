import type { GroupRecord } from './records.ts'

export function upsertGroupRecord(newGroup: GroupRecord, groups: readonly GroupRecord[]): GroupRecord[] {
	if (groups.some(group => group.code === newGroup.code)) return groups.map(group => group.code === newGroup.code ? newGroup : group)
	return [...groups, newGroup]
}

export function removeGroupRecord(code: string, groups: readonly GroupRecord[]): GroupRecord[] {
	return groups.filter(group => group.code !== code)
}
