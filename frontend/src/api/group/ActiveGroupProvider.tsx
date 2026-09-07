import { type ReactNode, createContext, useContext, useMemo } from 'react'
import { useQuery } from '@apollo/client/react'

import { sortBy } from '@step-wise/js-utils'

import { useUserId } from '../user/index.ts'

import type { ActiveGroupState, GroupMember } from './types.ts'
import { MY_ACTIVE_GROUP_QUERY } from './groupQueries.ts'
import { useMyActiveGroupSubscription } from './groupSubscriptions.ts'
import { groupRecordToGroup } from './conversion.ts'

const ActiveGroupContext = createContext<ActiveGroupState | undefined>(undefined)

export function ActiveGroupProvider({ children }: { children: ReactNode }) {
	const userId = useUserId()
	const query = useQuery(MY_ACTIVE_GROUP_QUERY, { skip: !userId })
	useMyActiveGroupSubscription(query.subscribeToMore, !!userId)

	const record = query.data?.myActiveGroup
	const currentMember = record?.members.find(member => member.userId === userId)
	const group = useMemo(() => currentMember?.active && record ? groupRecordToGroup(record) : undefined, [currentMember?.active, record])
	const value = useMemo<ActiveGroupState>(() => ({ group, loading: query.loading, error: query.error }), [group, query.error, query.loading])

	return <ActiveGroupContext.Provider value={value}>{children}</ActiveGroupContext.Provider>
}

export function useActiveGroupState(): ActiveGroupState {
	const context = useContext(ActiveGroupContext)
	if (!context) throw new Error('Active-group hooks must be used within an ActiveGroupProvider.')
	return context
}

export function useActiveGroup() {
	return useActiveGroupState().group
}

export function useOtherGroupMembers(members: GroupMember[]): GroupMember[] {
	const userId = useUserId()
	return useMemo(() => {
		const otherMembers = members.filter(member => member.userId !== userId)
		const groups = [otherMembers.filter(member => member.active), otherMembers.filter(member => !member.active)]
		const activity = groups.map(group => group.map(member => member.lastActivity.getTime()))
		return groups.flatMap((group, index) => sortBy(group, activity[index] ?? [], { order: 'descending' }))
	}, [members, userId])
}

export function useSortedGroupMembers(members: GroupMember[]): GroupMember[] {
	const userId = useUserId()
	const otherMembers = useOtherGroupMembers(members)
	const user = members.find(member => member.userId === userId)
	return useMemo(() => user ? [user, ...otherMembers] : otherMembers, [otherMembers, user])
}