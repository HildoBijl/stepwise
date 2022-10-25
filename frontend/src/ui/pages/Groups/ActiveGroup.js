import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import { ExitToApp } from '@material-ui/icons'

import { usePaths } from 'ui/routing'
import { Head, Par, List } from 'ui/components/containers'
import { useDeactivateGroupMutation } from 'api/group'

import { groupPossibilities, useOtherMembers } from './util'
import MemberList from './MemberList'

const useStyles = makeStyles((theme) => ({
	memberListContainer: {
		display: 'flex',
		flexFlow: 'row nowrap',
		alignItems: 'center',

		'& .memberList': {
			flexGrow: 1,
		},

		'& .deactivateButton': {
			flexGrow: 0,
		},
	},
}))

export default function ActiveGroup({ group }) {
	const classes = useStyles()
	const paths = usePaths()
	const [deactivateGroup] = useDeactivateGroupMutation()
	const otherMembers = useOtherMembers(group.members)

	// Set up a leave button.
	const leaveButton = <Button
		className="leaveButton"
		variant="contained"
		size="small"
		color="secondary"
		endIcon={<ExitToApp />}
		onClick={deactivateGroup}
	>Verlaat deze groep</Button>

	return <>
		<Head>Je actieve groep: <Link to={paths.group({ code: group.code })}>{group.code}</Link></Head>
		{otherMembers.length === 0 ?
			<>
				<CodeShareConditions group={group} />
				{leaveButton}
			</> :
			<div className={classes.memberListContainer}>
				<MemberList members={otherMembers} />
				{leaveButton}
			</div>}
	</>
}

function CodeShareConditions({ group }) {
	const paths = usePaths()
	return <>
		<Par>Je zit nu in de samenwerkingsgroep <Link to={paths.group({ code: group.code })}>{group.code}</Link>. Je bent nog de enige in deze groep. Deel de samenwerkingscode of de <Link to={paths.group({ code: group.code })}>link</Link> met je studiegenoten om met hen samen te werken.</Par>

		<Par>
			Elke persoon die de code invoert krijgt toegang tot de samenwerkingsgroep. Dit omvat:
			<List items={groupPossibilities} />
			Je kunt een samenwerkingsgroep altijd verlaten en/of vergeten. Als je een samenwerkingsgroep vergeet, dan worden al je sporen uit deze samenwerkingsgroep gewist.
		</Par>
	</>
}