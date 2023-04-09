import React, { createContext, useContext } from 'react'

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
