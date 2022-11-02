
import React, { createContext, useContext } from 'react'

import { useUserId } from '../user'

import { useMyActiveGroupQuery } from './groupQueries'
import { useActiveGroupExercises } from './exerciseQueries'
import { useMyActiveGroupSubscription } from './groupSubscriptions'

// Put the query results in a context, so there's a single source of truth.
const GroupContext = createContext(null)
export function ActiveGroupProvider({ children }) {
	// Load in the active group, if it exists.
	const userId = useUserId()
	const activeGroupResult = useMyActiveGroupQuery(!!userId)
	useMyActiveGroupSubscription(activeGroupResult.subscribeToMore, !!userId)

	// Load in all exercise data of the given group.
	const myActiveGroup = activeGroupResult && activeGroupResult.data && activeGroupResult.data.myActiveGroup
	const groupExercisesResult = useActiveGroupExercises(myActiveGroup?.code, !!myActiveGroup)

	return (
		<GroupContext.Provider value={{ activeGroupResult, groupExercisesResult }}>
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
export function useGroupExercisesResult() {
	return useContext(GroupContext).groupExercisesResult
}

// Get the active exercises for the currently active group.
export function useGroupExercises() {
	const result = useGroupExercisesResult()
	return result && result.data && result.data.activeGroupExercises
}

// Get the active exercise for a given skill for the currently active group.
export function useGroupExerciseForSkill(skillId) {
	const groupExercises = useGroupExercises()
	return groupExercises && groupExercises.find(exercise => exercise.skillId === skillId)
}
