import React from 'react'

import { useUserResult, useUser } from 'api/user'
import { useActiveGroupResult, useActiveGroup } from 'api/group'
import LoadingNote from 'ui/components/flow/LoadingNote'

import ExercisePageForStranger from './ExercisePageForStranger'
import ExercisePageForUser from './ExercisePageForUser'
import ExercisePageForGroup from './ExercisePageForGroup'

export default function ExercisePage() {
	const { loading: userLoading } = useUserResult()
	const { loading: groupLoading } = useActiveGroupResult()
	const user = useUser()
	const activeGroup = useActiveGroup()

	if (userLoading || groupLoading)
		return <LoadingNote text="Loading user data." />

	if (activeGroup)
		return <ExercisePageForGroup />
	if (user)
		return <ExercisePageForUser />
	return <ExercisePageForStranger />
}
