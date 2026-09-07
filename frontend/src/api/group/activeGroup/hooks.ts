import { useMemo } from 'react'

import { sortBy } from '@step-wise/js-utils'

import { useUserId } from '../../user/index.ts'

import type { ActiveGroupState, Group, GroupMember } from '../types.ts'

import { useActiveGroupContext } from './context.ts'

export function useActiveGroupState(): ActiveGroupState {
	return useActiveGroupContext()
}

export function useActiveGroup(): Group | undefined {
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
