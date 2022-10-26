import React, { useState, useEffect, useRef } from 'react'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Tooltip from '@material-ui/core/Tooltip'

import { lastOf } from 'step-wise/util/arrays'

import { usePrevious } from 'util/react'
import { useActiveGroup } from 'api/group/Provider'
import { usePaths } from 'ui/routing'

import { useOtherMembers } from './util'

const useStyles = makeStyles((theme) => ({
	groupIndicator: {
		alignItems: 'center',
		background: ({ lastEvent }) => lastEvent ? (lastEvent.increase ? theme.palette.primary.main : theme.palette.secondary.main) : theme.palette.info.main,
		borderRadius: '10px',
		cursor: 'pointer',
		display: 'flex',
		flexFlow: 'row nowrap',
		filter: 'drop-shadow(-2px 6px 6px rgba(0, 0, 0, 1))',
		height: '40px',
		marginLeft: '16px',
		transform: 'translateY(-1px)', // Compensation for the drop shadow. This makes it feel more balanced.
		transition: ({ lastEvent }) => `background-color ${lastEvent ? theme.transitions.duration.standard : 6000}ms`,
		width: '40px',

		'& .contents': {
			color: theme.palette.info.contrastText,
			fontSize: '1.2rem',
			fontWeight: 'bold',
			textAlign: 'center',
			textDecoration: 'none',
			width: '100%',
		},
	},
}))

export default function GroupIndicator() {
	const activeGroup = useActiveGroup()
	return activeGroup ? <GroupIndicatorInternal group={activeGroup} /> : null
}

function GroupIndicatorInternal({ group }) {
	const paths = usePaths()
	const activeGroup = useActiveGroup()
	const navigate = useNavigate()

	// Determine the names of active members.
	const activeMembers = group.members.filter(member => member.active)
	const otherMembers = useOtherMembers(activeMembers)
	const memberNames = otherMembers.map(member => member.name)
	const nameString = memberNames.slice(0, -1).join(', ') + (memberNames.length > 1 ? ' en ' : '') + lastOf(memberNames)

	// Check if the number of active members have changed and adjust visuals accordingly.
	const numActiveMembers = activeMembers.length
	const prevNumActiveMembers = usePrevious(numActiveMembers)
	const [lastEvent, setLastEvent] = useState()
	const timeoutRef = useRef()
	useEffect(() => {
		if (prevNumActiveMembers !== undefined && numActiveMembers !== prevNumActiveMembers) {
			setLastEvent({ increase: numActiveMembers > prevNumActiveMembers, time: new Date() }) // Set the event.
			clearTimeout(timeoutRef.current)
			timeoutRef.current = setTimeout(() => setLastEvent(), 12000) // And deactivate again after some time.
		}
	}, [numActiveMembers, prevNumActiveMembers])

	// Render the indicator.
	const classes = useStyles({ lastEvent })
	return <Tooltip title={<span>{activeMembers.length === 0 ? `Er zijn nog geen anderen aanwezig.` : `Je werkt samen met ${nameString}.`}</span>} arrow>
		<div className={clsx(classes.groupIndicator, 'groupIndicator')} onClick={() => navigate(paths.groups({ code: activeGroup.code }))}>
			<div className="contents">{activeMembers.length}</div>
		</div>
	</Tooltip>
}