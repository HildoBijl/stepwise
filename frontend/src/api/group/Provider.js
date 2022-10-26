
import React, { createContext, useContext } from 'react'

import { useUserId } from '../user'

import { useMyActiveGroupQuery } from './queries'
import { useMyActiveGroupSubscription } from './subscriptions'

// Put the query results in a context, so there's a single source of truth.
const GroupContext = createContext(null)
export function ActiveGroupProvider({ children }) {
	const userId = useUserId()
	const result = useMyActiveGroupQuery(!!userId)
	useMyActiveGroupSubscription(result.subscribeToMore, !!userId)

	return (
		<GroupContext.Provider value={result}>
			{children}
		</GroupContext.Provider>
	)
}

// Get the query data out of the context.
export function useActiveGroupResult() {
	return useContext(GroupContext)
}

// Only get the resulting active group. Also check if the user is actually active. (On deactivations, immediately give null for a speedy response to outdated cache data.)
export function useActiveGroup() {
	const res = useActiveGroupResult()
	const userId = useUserId()
	const myActiveGroup = res && res.data && res.data.myActiveGroup
	const member = myActiveGroup && myActiveGroup.members && myActiveGroup.members.find(member => member.userId === userId)
	return (member && member.active) ? myActiveGroup : null
}
