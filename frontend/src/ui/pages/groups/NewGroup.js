import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'
import { Done, Clear } from '@mui/icons-material'

import { Translation, TranslationCatalog, TranslationGroup } from '@step-wise/i18n'

import { useCreateGroup, useActiveGroup } from 'api'

import { usePaths } from 'ui/routingTools'
import { Par, List } from 'ui/components'

import { groupPossibilities } from './support'

export function NewGroup() {
	const paths = usePaths()
	const navigate = useNavigate()
	const [createGroup] = useCreateGroup()

	// If there is an active group, go to the main group page.
	const activeGroup = useActiveGroup()
	useEffect(() => {
		if (activeGroup)
			navigate(paths.groups())
	}, [activeGroup, navigate, paths])

	return <TranslationCatalog folder={['pages']} name="groups">
		<TranslationGroup path="newGroup">
			<Par><Translation id="paragraph1">You are about to create a new practice group. This will give you a code/link to share with your fellow students. Each person entering the code will get access to the practice group. This includes:</Translation>
				<List>
					{groupPossibilities.map((item, index) => <List.Item key={index}>{item}</List.Item>)}
				</List>
				<Translation id="paragraph2">You can always leave and/or forget a practice group. Upon forgetting a practice group, all your traces from the group will be permanently erased.</Translation>
			</Par>
			<Par>
				<Button
					variant="contained"
					color="primary"
					startIcon={<Done />}
					onClick={() => {
						createGroup()
							.then(() => navigate(paths.groups()))
							.catch(() => {})
					}}
					style={{ margin: '0.5rem' }}
				><Translation id="agreeButton">Yes, I agree</Translation></Button>
				<Button
					variant="contained"
					color="secondary"
					startIcon={<Clear />}
					onClick={() => navigate(paths.groups())}
					style={{ margin: '0.5rem' }}
				><Translation id="disagreeButton">No, I don't want that</Translation></Button>
			</Par>
		</TranslationGroup>
	</TranslationCatalog>
}
