import React from 'react'

import { useUserResult, useUser } from 'api/user'
import { useActiveGroupResult, useActiveGroup } from 'api/group'
import { useTranslator } from 'i18n'
import { LoadingNote } from 'ui/components'

import { ExercisePageForStranger } from './ExercisePageForStranger'
import { ExercisePageForUser } from './ExercisePageForUser'
import { ExercisePageForGroup } from './ExercisePageForGroup'

export function ExercisePage({ skillId }) {
	const translate = useTranslator()
	const { loading: userLoading } = useUserResult()
	const { loading: groupLoading } = useActiveGroupResult()
	const user = useUser()
	const activeGroup = useActiveGroup()

	if (userLoading || groupLoading)
		return <LoadingNote text={translate('Loading user data...', 'loadingNotes.loadingUserData', 'eduTools/pages/skillPage')} />

	if (activeGroup)
		return <ExercisePageForGroup skillId={skillId} />
	if (user)
		return <ExercisePageForUser skillId={skillId} />
	return <ExercisePageForStranger skillId={skillId} />
}
