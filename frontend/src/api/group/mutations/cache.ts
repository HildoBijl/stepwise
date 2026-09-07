import type { ApolloCache } from '@apollo/client'

import type { GroupRecord } from '../records.ts'
import { upsertGroupRecord } from '../recordLists.ts'
import { MY_ACTIVE_GROUP_QUERY } from '../queries/useMyActiveGroup.ts'
import { MY_GROUPS_QUERY } from '../queries/useMyGroups.ts'

export function writeActiveGroup(cache: ApolloCache, group: GroupRecord | null): void {
	cache.writeQuery({ query: MY_ACTIVE_GROUP_QUERY, data: { myActiveGroup: group } })
}

export function addGroupToCachedLists(cache: ApolloCache, group: GroupRecord): void {
	writeActiveGroup(cache, group)
	const groups = cache.readQuery({ query: MY_GROUPS_QUERY })?.myGroups
	if (groups) cache.writeQuery({ query: MY_GROUPS_QUERY, data: { myGroups: upsertGroupRecord(group, groups) } })
}
