import React from 'react'

import { useUserResult, useUser } from 'api/user'
import { useActiveGroupResult, useActiveGroup } from 'api/group'
import { useTranslator } from 'i18n'
import { LoadingNote } from 'ui/components'

import { ExercisePageForStranger } from './ExercisePageForStranger'
import { ExercisePageForUser } from './ExercisePageForUser'
import { ExercisePageForGroup } from './ExercisePageForGroup'

export function ExercisePage() {
	const translate = useTranslator()
	const { loading: userLoading } = useUserResult()
	const { loading: groupLoading } = useActiveGroupResult()
	const user = useUser()
	const activeGroup = useActiveGroup()

	if (userLoading || groupLoading)
		return <LoadingNote text={translate('Loading user data...', 'loadingUserData', 'edu/skills/skillPage')} />

	if (activeGroup)
		return <ExercisePageForGroup />
	if (user)
		return <ExercisePageForUser />
	return <ExercisePageForStranger />
}
