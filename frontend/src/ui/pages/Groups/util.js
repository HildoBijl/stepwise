import React, { useMemo } from 'react'

import { sortByIndices } from 'step-wise/util'

import { useUserId } from 'api/user'
import { Translation } from 'i18n'

export const translationPath = 'pages/groups'

// groupPossibilities is a React list of possibilities that group members have. It is shown at various points in the app.
export const groupPossibilities = [
	<Translation path={translationPath} entry="groupPossibilities.entry1">See who is active in the group and whether they are online/active.</Translation>,
	<Translation path={translationPath} entry="groupPossibilities.entry2">At exercises: view the submissions of other group members.</Translation>,
	<Translation path={translationPath} entry="groupPossibilities.entry3">Get suggestions on which skill is best to practice, also based on the level of other active group members.</Translation>
]

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
