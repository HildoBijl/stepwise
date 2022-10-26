import React, { useMemo } from 'react'

import { sortByIndices } from 'step-wise/util/arrays'

import { useUserId } from 'api/user'

// groupPossibilities is a React list of possibilities that group members have. It is shown at various points in the app.
export const groupPossibilities = [
	<>Zien wie er in de samenwerkingsgroep zit en of ze online/actief zijn.</>,
	<>Bij opgaven: de inzendingen van groepsgenoten inzien.</>,
	<>Tips krijgen over welke vaardigheid handig is om te oefenen, gezien het niveau van actieve groepsgenoten.</>
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

