import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { findOptimum } from 'step-wise/util/arrays'
import { ensureDate, formatDate } from 'step-wise/util/date'

import { useAllUsersQuery } from 'api/admin'
import { Par } from 'ui/components/containers'
import { usePaths } from 'ui/routing'
import HorizontalSlider from 'ui/components/layout/HorizontalSlider'

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
			width: '120px',
		},
		'& .email': {
			width: '220px',
		},
		'& .role': {
			width: '80px',
			textAlign: 'center',
		},
		'& .stats': {
			width: '100px',
			textAlign: 'center',
		},
		'& .updatedAt': {
			width: '80px',
			textAlign: 'center',
		},
		'& .createdAt': {
			width: '80px',
			textAlign: 'center',
		},
	},
}))

export default function UserOverview() {
	const res = useAllUsersQuery()

	// Check if data has loaded properly.
	if (res.loading)
		return <Par>Gebruikers worden geladen...</Par>
	if (res.error || !res.data || !res.data.allUsers) {
		console.log(res)
		return <Par>Oops... De gebruikers konden niet geladen worden.</Par>
	}

	// All loaded!
	const allUsers = res.data.allUsers
	return <UserOverviewWithData allUsers={allUsers} />
}

function UserOverviewWithData({ allUsers }) {
	const classes = useStyles()

	// Sort all users by their last activity.
	const usersWithLastActivity = useMemo(() => {
		// Find the last activity of each user.
		const usersWithLastActivity = allUsers.map(user => {
			const activitiesAt = [user.updatedAt, ...user.skills.map(skill => skill.updatedAt)].map(ensureDate)
			return {
				user,
				lastActivity: findOptimum(activitiesAt, (a, b) => a > b),
			}
		})

		// Sort by the last activity.
		return usersWithLastActivity.sort((a, b) => b.lastActivity - a.lastActivity)
	}, [allUsers])

	return <>
		<Par>Hieronder vind je alle gebruikers die ooit op Step-Wise ingelogd zijn, gesorteerd op wanneer ze voor het laatst actief waren.</Par>
		<HorizontalSlider>
			<div className={clsx(classes.userOverview, 'userOverview')}>
				<div className="name head">Naam</div>
				<div className="stats head">Vaardigheden</div>
				<div className="updatedAt head">Laatst actief</div>
				<div className="createdAt head">Eerst actief</div>
				<div className="role head">Rechten</div>
				<div className="email head">Emailadres</div>

				{usersWithLastActivity.map(userWithLastActivity => <UserOverviewItem key={userWithLastActivity.user.id} user={userWithLastActivity.user} lastActivity={userWithLastActivity.lastActivity} />)}
			</div>
		</HorizontalSlider>
	</>
}

function UserOverviewItem({ user, lastActivity }) {
	const paths = usePaths()
	return <>
		<div className="name"><Link to={paths.userInspection({ userId: user.id })}>{user.name}</Link></div>
		<div className="stats">{user.skills.length}</div>
		<div className="updatedAt">{formatDate(lastActivity)}</div>
		<div className="createdAt">{formatDate(user.createdAt)}</div>
		<div className="role">{user.role === 'admin' ? 'Admin' : (user.role === 'teacher' ? 'Docent' : 'Student')}</div>
		<div className="email">{user.email}</div>
	</>
}