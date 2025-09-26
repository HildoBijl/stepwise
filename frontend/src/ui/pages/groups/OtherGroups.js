import React from 'react'
import { Link } from 'react-router-dom'
import { Box, Button, useMediaQuery } from '@mui/material'
import { Clear } from '@mui/icons-material'

import { useLeaveGroupMutation, useSelfAndOtherMembers } from 'api'
import { Translation } from 'i18n'
import { usePaths } from 'ui/routingTools'
import { Head, MemberList } from 'ui/components'

export function OtherGroups({ groups, hasActiveGroup }) {
	return <>
		<Head><Translation entry="olderGroups.title">Previous groups</Translation></Head>
		<Box sx={{
			display: 'grid',
			gap: '0.5rem 0.5rem',
			gridTemplateColumns: 'auto 1fr auto',
			gridTemplateRows: 'auto',
			placeItems: 'center start',
		}}>
			{groups.map(group => <OtherGroup key={group.code} group={group} />)}
		</Box>
	</>
}

function OtherGroup({ group }) {
	const paths = usePaths()
	const [leaveGroup] = useLeaveGroupMutation(group.code)
	const membersSorted = useSelfAndOtherMembers(group.members)
	const wideScreen = useMediaQuery('(min-width:600px)')

	return <>
		<Link to={paths.group({ code: group.code })} style={{ width: '100%' }}>
			<Button variant="contained" size="small" color="primary" sx={{ width: '100%' }}>{wideScreen ? <><Translation entry="olderGroups.code">Code</Translation> </> : ''}{group.code}</Button>
		</Link>
		<MemberList members={membersSorted} />
		<Button variant="contained" size="small" color="secondary" endIcon={wideScreen ? <Clear /> : null} onClick={leaveGroup} sx={{ width: '100%' }}>{wideScreen ? <Translation entry="olderGroups.forgetGroup">Forget this group</Translation> : <Clear />}</Button>
	</>
}
