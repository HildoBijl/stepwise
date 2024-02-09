import React, { useState, useEffect, useRef } from 'react'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Tooltip from '@material-ui/core/Tooltip'

import { usePrevious } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests.
import { useActiveGroup, useOtherMembers } from 'api/group'
import { TranslationFile, TranslationSection, Translation, WordList } from 'i18n'
import { usePaths } from 'ui/routingTools'

import { translationPath } from './support'

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

export function GroupIndicator() {
	const activeGroup = useActiveGroup()
	return activeGroup ? <GroupIndicatorInternal group={activeGroup} /> : null
}

function GroupIndicatorInternal({ group }) {
	const paths = usePaths()
	const navigate = useNavigate()

	// Determine the names of active members.
	const activeMembers = group.members.filter(member => member.active)
	const otherMembers = useOtherMembers(activeMembers)
	const names = otherMembers.map(member => member.name)

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
	return <TranslationFile path={translationPath} extend={false}>
		<TranslationSection entry="indicator">
			<Tooltip title={<span>{numActiveMembers <= 1 ? <Translation entry="noOthers">No other group members are present yet.</Translation> : <Translation entry="others">You are working together with <WordList words={names} />.</Translation>}</span>} arrow>
				<div className={clsx(classes.groupIndicator, 'groupIndicator')} onClick={() => navigate(paths.groups({ code: group.code }))}>
					<div className="contents">{activeMembers.length}</div>
				</div>
			</Tooltip>
		</TranslationSection>
	</TranslationFile>
}
