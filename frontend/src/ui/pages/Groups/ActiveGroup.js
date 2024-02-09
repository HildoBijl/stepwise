import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Button from '@material-ui/core/Button'
import { ExitToApp } from '@material-ui/icons'

import { TranslationSection, Translation } from 'i18n'
import { useDeactivateGroupMutation, useSelfAndOtherMembers } from 'api/group'
import { usePaths } from 'ui/routingTools'
import { Head, MemberList } from 'ui/components'

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

export function ActiveGroup({ group }) {
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
	>{wideScreen ? <Translation entry="deactivateButton">Leave this group</Translation> : <ExitToApp />}</Button>

	return <TranslationSection entry="activeGroup">
		<Head><Translation entry="activeGroup">Your active group: <Link to={paths.group({ code: group.code })}>{{ code: group.code }}</Link></Translation></Head>
		<div className={classes.memberListContainer}>
			{membersSorted.length === 1 ? <div className="emptyNote"><Translation entry="emptyGroup">There is no one else in group <Link to={paths.group({ code: group.code })}>{{ code: group.code }}</Link>. Share the code/<Link to={paths.group({ code: group.code })}>link</Link> with your fellow students to practice together.</Translation></div> : <MemberList members={membersSorted} />}
			<div className="buttonContainer">{deactivateButton}</div>
		</div>
	</TranslationSection>
}
