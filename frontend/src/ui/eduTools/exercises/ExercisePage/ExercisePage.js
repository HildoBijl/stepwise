import React from 'react'
import { useTextTranslation } from '@step-wise/i18n'

import { useUser, useIsUserLoading, useActiveGroupState, useActiveGroup } from 'api'
import { LoadingNote } from 'ui/components'

import { ExercisePageForStranger } from './ExercisePageForStranger'
import { ExercisePageForUser } from './ExercisePageForUser'
import { ExercisePageForGroup } from './ExercisePageForGroup'

export function ExercisePage({ skillId }) {
	const loadingUserData = useTextTranslation({ folder: ['eduTools', 'pages'], catalog: 'skillPage', group: ['loadingNotes'], id: 'loadingUserData', source: 'Loading user data...' })
	const userLoading = useIsUserLoading()
	const { loading: groupLoading } = useActiveGroupState()
	const user = useUser()
	const activeGroup = useActiveGroup()

	if (userLoading || groupLoading)
		return <LoadingNote text={loadingUserData} />

	if (activeGroup)
		return <ExercisePageForGroup skillId={skillId} />
	if (user)
		return <ExercisePageForUser skillId={skillId} />
	return <ExercisePageForStranger skillId={skillId} />
}
