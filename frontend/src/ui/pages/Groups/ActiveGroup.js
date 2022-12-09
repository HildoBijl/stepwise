import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Button from '@material-ui/core/Button'
import { ExitToApp } from '@material-ui/icons'

import { usePaths } from 'ui/routing'
import { Head } from 'ui/components/containers'
import { useDeactivateGroupMutation } from 'api/group'

import { useSelfAndOtherMembers } from './util'
import MemberList from './MemberList'

const useStyles = makeStyles((theme) => ({
	memberListContainer: {
		display: 'flex',
		flexFlow: 'row nowrap',
		alignItems: 'center',

		'& .memberList, & .emptyNote': {
			flexGrow: 1,
			flexShrink: 1,
		},

		'& .buttonContainer': {
			flexGrow: 0,
			flexShrink: 0,
			marginLeft: '0.75rem',
		},
	},
}))

export default function ActiveGroup({ group }) {
	const classes = useStyles()
	const paths = usePaths()
	const [deactivateGroup] = useDeactivateGroupMutation()
	const membersSorted = useSelfAndOtherMembers(group.members)
	const wideScreen = useMediaQuery('(min-width:600px)')

	// Set up a deactivate button.
	const deactivateButton = <Button
		className="deactivateButton"
		variant="contained"
		size="small"
		color="secondary"
		endIcon={wideScreen ? <ExitToApp /> : null}
		onClick={deactivateGroup}
	>{wideScreen ? 'Verlaat deze groep' : <ExitToApp />}</Button>

	return <>
		<Head>Je actieve groep: <Link to={paths.group({ code: group.code })}>{group.code}</Link></Head>
		<div className={classes.memberListContainer}>
			{membersSorted.length === 1 ? <div className="emptyNote">Er zit nog niemand anders in groep <Link to={paths.group({ code: group.code })}>{group.code}</Link>
				. Deel de code/<Link to={paths.group({ code: group.code })}>link</Link> met je studiegenoten om samen te kunnen oefenen.</div> : <MemberList members={membersSorted} />}
			<div className="buttonContainer">{deactivateButton}</div>
		</div>
	</>
}
