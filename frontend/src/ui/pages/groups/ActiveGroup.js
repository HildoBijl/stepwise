import React from 'react'
import { Box, Button, useMediaQuery } from '@mui/material'
import { ExitToApp } from '@mui/icons-material'

import { Translation, TranslationGroup } from '@step-wise/i18n'

import { useDeactivateGroup, useSortedGroupMembers } from 'api'

import { usePaths } from 'ui/routingTools'
import { Head, Link, MemberList } from 'ui/components'

export function ActiveGroup({ group }) {
	const paths = usePaths()
	const [deactivateGroup] = useDeactivateGroup()
	const membersSorted = useSortedGroupMembers(group.members)
	const wideScreen = useMediaQuery('(min-width:600px)')

	// Set up a deactivate button.
	const deactivateButton = <Button
		className="deactivateButton"
		variant="contained"
		size="small"
		color="secondary"
		endIcon={wideScreen ? <ExitToApp /> : null}
		onClick={() => deactivateGroup().catch(() => {})}
	>{wideScreen ? <Translation id="deactivateButton">Leave this group</Translation> : <ExitToApp />}</Button>

	return <TranslationGroup path="activeGroup">
		<Head><Translation id="activeGroup">Your active group: <Link to={paths.group({ code: group.code })}>{{ code: group.code }}</Link></Translation></Head>
		<Box sx={{ display: 'flex', flexFlow: 'row nowrap', alignItems: 'center' }}>
			{membersSorted.length === 1 ? <Box sx={{ flexGrow: 1, flexShrink: 1 }}><Translation id="emptyGroup">There is no one else in group <Link to={paths.group({ code: group.code })}>{{ code: group.code }}</Link>. Share the code/<Link to={paths.group({ code: group.code })}>link</Link> with your fellow students to practice together.</Translation></Box> : <MemberList members={membersSorted} sx={{ flexGrow: 1, flexShrink: 1 }} />}
			<Box sx={{ flexGrow: 0, flexShrink: 0, marginLeft: '0.75rem' }}>{deactivateButton}</Box>
		</Box>
	</TranslationGroup>
}
