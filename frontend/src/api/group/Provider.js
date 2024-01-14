import React, { createContext, useContext, useMemo } from 'react'

import { sortByIndices } from 'step-wise/util'

import { useUserId } from '../user'

import { useMyActiveGroupQuery } from './groupQueries'
import { useMyActiveGroupSubscription } from './groupSubscriptions'
import { useActiveGroupExercisesQuery } from './exerciseQueries'
import { useActiveGroupExercisesSubscription } from './exerciseSubscriptions'

// Put the query results in a context, so there's a single source of truth.
const GroupContext = createContext(null)
export function ActiveGroupProvider({ children }) {
	// Load in the active group, if it exists.
	const userId = useUserId()
	const activeGroupResult = useMyActiveGroupQuery(!!userId)
	useMyActiveGroupSubscription(activeGroupResult.subscribeToMore, !!userId)

	// Load in all exercise data of the given group.
	const myActiveGroup = activeGroupResult && activeGroupResult.data && activeGroupResult.data.myActiveGroup
	const activeGroupExercisesResult = useActiveGroupExercisesQuery(myActiveGroup?.code, !!myActiveGroup)
	useActiveGroupExercisesSubscription(myActiveGroup?.code, activeGroupExercisesResult.subscribeToMore, !!myActiveGroup)

	return (
		<GroupContext.Provider value={{ activeGroupResult, activeGroupExercisesResult }}>
			{children}
		</GroupContext.Provider>
	)
}

// Get the active group query data out of the context.
export function useActiveGroupResult() {
	return useContext(GroupContext).activeGroupResult
}

// Only get the resulting active group. Also check if the user is actually active: on deactivations, immediately give null for a speedy response to outdated cache data.
export function useActiveGroup() {
	const userId = useUserId()
	const result = useActiveGroupResult()
	const myActiveGroup = result && result.data && result.data.myActiveGroup
	const member = myActiveGroup && myActiveGroup.members && myActiveGroup.members.find(member => member.userId === userId)
	return (member && member.active) ? myActiveGroup : null
}

// Get the group exercises query data out of the context.
export function useActiveGroupExercisesResult() {
	return useContext(GroupContext).activeGroupExercisesResult
}

// Get the active exercises for the currently active group.
export function useActiveGroupExercises() {
	const result = useActiveGroupExercisesResult()
	return result && result.data && result.data.activeGroupExercises
}

// Get the active exercise for a given skill for the currently active group.
export function useActiveGroupExerciseForSkill(skillId) {
	const activeGroupExercises = useActiveGroupExercises()
	return activeGroupExercises && activeGroupExercises.find(exercise => exercise.skillId === skillId)
}

// useOtherMembers takes a list of members, filters out the given user, and sorts the remaining members according to their activity. It puts currently active users always first, and then sorts by the most recent activity.
export function useOtherMembers(members) {
	const userId = useUserId()
	return useMemo(() => {
		const otherMembers = members.filter(member => member.userId !== userId)
		const otherMembersByActive = [otherMembers.filter(member => member.active), otherMembers.filter(member => !member.active)]
		const lastMemberActivity = otherMembersByActive.map(list => list.map(member => new Date(member.lastActivity).getTime()))
		return otherMembersByActive.map((list, index) => sortByIndices(list, lastMemberActivity[index], false)).flat()
	}, [members, userId])
}

// useSelfAndOtherMembers takes a list of members, puts the current user at the front, and sorts out the remaining members through useOtherMembers.
export function useSelfAndOtherMembers(members) {
	const userId = useUserId()
	const otherMembers = useOtherMembers(members)
	const user = members.find(member => member.userId === userId)
	return useMemo(() => user ? [user, ...otherMembers] : otherMembers, [user, otherMembers])
}
