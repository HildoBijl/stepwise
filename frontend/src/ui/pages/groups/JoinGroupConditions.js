import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'
import { Done, Clear } from '@mui/icons-material'

import { useJoinGroupMutation } from 'api/group'
import { TranslationSection, Translation } from 'i18n'
import { usePaths } from 'ui/routingTools'
import { Par, List } from 'ui/components'

import { groupPossibilities } from './support'

export function JoinGroupConditions({ code }) {
	const paths = usePaths()
	const navigate = useNavigate()
	const [joinGroup] = useJoinGroupMutation()

	return <TranslationSection entry="joinGroupConditions">
		<Par>
			<Translation entry="paragraph1">You are about to join the practice group {{ code: code.toUpperCase() }}. This will allow you to:</Translation>
			<List items={groupPossibilities} />
			<Translation entry="paragraph2">All current and future members of the practice group are of course also able to do so. You can always leave and/or forget a practice group. If you leave a practice group, all your traces from this group will be permanently erased.</Translation>
		</Par>
		<Par>
			<Button
				variant="contained"
				color="primary"
				startIcon={<Done />}
				onClick={() => joinGroup(code)}
				sx={{ margin: '0.5rem' }}
			><Translation entry="agreeButton">Yes, I agree</Translation></Button>
			<Button
				variant="contained"
				color="secondary"
				startIcon={<Clear />}
				onClick={() => navigate(paths.groups())}
				sx={{ margin: '0.5rem' }}
			><Translation entry="disagreeButton">No, I don't want that</Translation></Button>
		</Par>
	</TranslationSection>
}
