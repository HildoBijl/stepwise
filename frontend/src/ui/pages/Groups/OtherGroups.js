import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Button from '@material-ui/core/Button'
import { Clear } from '@material-ui/icons'

import { usePaths } from 'ui/routing'
import { Head } from 'ui/components/containers'
import { useLeaveGroupMutation } from 'api/group'

import { useSelfAndOtherMembers } from './util'
import MemberList from './MemberList'

const useStyles = makeStyles((theme) => ({
	otherGroups: {
		display: 'grid',
		gap: '0.5rem 0.5rem',
		gridTemplateColumns: 'auto 1fr auto',
		gridTemplateRows: 'auto',
		placeItems: 'center start',

		'& .groupCode': {
			width: '100%',
			'& .groupCodeButton': {
				width: '100%',
			},
		},
		'& .groupMembers': {
		},
		'& .groupLeaveButton': {
			width: '100%',
		},
	},
}))

export default function OtherGroups({ groups, hasActiveGroup }) {
	const classes = useStyles()
	return <>
		<Head>Oudere groepen</Head>
		<div className={classes.otherGroups}>
			{groups.map(group => <OtherGroup key={group.code} group={group} />)}
		</div>
	</>
}

function OtherGroup({ group }) {
	const paths = usePaths()
	const [leaveGroup] = useLeaveGroupMutation(group.code)
	const membersSorted = useSelfAndOtherMembers(group.members)
  const wideScreen = useMediaQuery('(min-width:600px)')

	return <>
		<Link className="groupCode" to={paths.group({ code: group.code })}>
			<Button
				className="groupCodeButton"
				variant="contained"
				size="small"
				color="primary"
			>{wideScreen ? 'Code ' : ''}{group.code}</Button>
		</Link>
		<MemberList className="groupMembers" members={membersSorted} />
		<Button
			className="leaveButton"
			variant="contained"
			size="small"
			color="secondary"
			endIcon={wideScreen ? <Clear /> : null}
			onClick={leaveGroup}
		>{wideScreen ? 'Vergeet deze groep' : <Clear />}</Button>
	</>
}