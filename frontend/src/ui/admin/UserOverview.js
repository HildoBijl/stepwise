import React from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { findOptimum } from 'step-wise/util/arrays'
import { ensureDate, formatDate } from 'step-wise/util/date'

import { useAllUsersQuery } from 'api/admin'
import { Par } from 'ui/components/containers'
import { usePaths } from 'ui/routing'

const useStyles = makeStyles((theme) => ({
	userOverview: {
		display: 'grid',
		gridGap: '0.5rem 0.8rem',
		gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr',
		placeItems: 'center stretch',
		width: '100%',

		'& .head': {
			fontWeight: 'bold',
		},

		'& .name': {
		},
		'& .email': {
		},
		'& .role': {
			textAlign: 'center',
		},
		'& .updatedAt': {
			textAlign: 'center',
		},
		'& .createdAt': {
			textAlign: 'center',
		},
		'& .stats': {
			textAlign: 'center',
		},
	},
}))

export default function UserOverview() {
	const res = useAllUsersQuery()
	const classes = useStyles()

	// Check if data has loaded properly.
	if (res.loading)
		return <Par>Gebruikers worden geladen...</Par>
	if (res.error || !res.data || !res.data.allUsers) {
		console.log(res)
		return <Par>Oops... De gebruikers konden niet geladen worden.</Par>
	}

	// Display the users.
	const allUsers = res.data.allUsers
	return <>
		<Par>Hieronder vind je alle gebruikers die ooit op Step-Wise ingelogd zijn.</Par>
		<div className={clsx(classes.userOverview, 'userOverview')}>
			<div className="name head">Naam</div>
			<div className="email head">Emailadres</div>
			<div className="role head">Rechten</div>
			<div className="stats head">Vaardigheden</div>
			<div className="updatedAt head">Laatst actief</div>
			<div className="createdAt head">Eerst actief</div>

			{allUsers.map(user => <UserOverviewItem key={user.id} user={user} />)}
		</div>
	</>
}

function UserOverviewItem({ user }) {
	const paths = usePaths()

	// Find the last activity.
	const activitiesAt = [user.updatedAt, ...user.skills.map(skill => skill.updatedAt)].map(ensureDate)
	const lastActivity = findOptimum(activitiesAt, (a,b) => a > b)

	// Display the item.
	return <>
		<div className="name"><Link to={paths.userInspection({ userId: user.id })}>{user.name}</Link></div>
		<div className="email">{user.email}</div>
		<div className="role">{user.role === 'admin' ? 'Admin' : (user.role === 'teacher' ? 'Docent' : 'Student')}</div>
		<div className="stats">{user.skills.length}</div>
		<div className="updatedAt">{formatDate(lastActivity)}</div>
		<div className="createdAt">{formatDate(user.createdAt)}</div>
	</>
}