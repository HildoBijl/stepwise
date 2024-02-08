import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import { Done, Clear } from '@material-ui/icons'

import { useCreateGroupMutation, useActiveGroup } from 'api/group'
import { TranslationFile, TranslationSection, Translation } from 'i18n'
import { usePaths } from 'ui/routingTools'
import { Par, List } from 'ui/components'

import { translationPath, groupPossibilities } from './util'

export function NewGroup() {
	const paths = usePaths()
	const navigate = useNavigate()
	const [createGroup] = useCreateGroupMutation()

	// If there is an active group, go to the main group page.
	const activeGroup = useActiveGroup()
	useEffect(() => {
		if (activeGroup)
			navigate(paths.groups())
	}, [activeGroup, navigate, paths])

	return <TranslationFile path={translationPath}>
		<TranslationSection entry="newGroup">
			<Par><Translation entry="paragraph1">You are about to create a new practice group. This will give you a code/link to share with your fellow students. Each person entering the code will get access to the practice group. This includes:</Translation>
				<List items={groupPossibilities} />
				<Translation entry="paragraph2">You can always leave and/or forget a practice group. Upon forgetting a practice group, all your traces from the group will be permanently erased.</Translation>
			</Par>
			<Par>
				<Button
					variant="contained"
					color="primary"
					startIcon={<Done />}
					onClick={() => {
						createGroup()
						navigate(paths.groups())
					}}
					style={{ margin: '0.5rem' }}
				><Translation entry="agreeButton">Yes, I agree</Translation></Button>
				<Button
					variant="contained"
					color="secondary"
					startIcon={<Clear />}
					onClick={() => navigate(paths.groups())}
					style={{ margin: '0.5rem' }}
				><Translation entry="disagreeButton">No, I don't want that</Translation></Button>
			</Par>
		</TranslationSection>
	</TranslationFile>
}
