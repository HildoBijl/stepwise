import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'
import { Done, Clear } from '@mui/icons-material'

import { Translation, TranslationGroup } from '@step-wise/i18n'

import { useJoinGroup } from 'api'

import { usePaths } from 'ui/routingTools'
import { Par, List } from 'ui/components'

import { groupPossibilities } from './support'

export function JoinGroupConditions({ code }) {
	const paths = usePaths()
	const navigate = useNavigate()
	const [joinGroup] = useJoinGroup()

	return <TranslationGroup path="joinGroupConditions">
		<Par>
			<Translation id="paragraph1">You are about to join the practice group {{ code: code.toUpperCase() }}. This will allow you to:</Translation>
			<List>
				{groupPossibilities.map((item, index) => <List.Item key={index}>{item}</List.Item>)}
			</List>
			<Translation id="paragraph2">All current and future members of the practice group are of course also able to do so. You can always leave and/or forget a practice group. If you leave a practice group, all your traces from this group will be permanently erased.</Translation>
		</Par>
		<Par>
			<Button
				variant="contained"
				color="primary"
				startIcon={<Done />}
				onClick={() => joinGroup(code).catch(() => {})}
				sx={{ margin: '0.5rem' }}
			><Translation id="agreeButton">Yes, I agree</Translation></Button>
			<Button
				variant="contained"
				color="secondary"
				startIcon={<Clear />}
				onClick={() => navigate(paths.groups())}
				sx={{ margin: '0.5rem' }}
			><Translation id="disagreeButton">No, I don't want that</Translation></Button>
		</Par>
	</TranslationGroup>
}
