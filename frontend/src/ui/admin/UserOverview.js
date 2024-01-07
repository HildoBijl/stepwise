import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { findOptimum, ensureDate, formatDate } from 'step-wise/util'

import { useAllUsersQuery } from 'api/admin'
import { usePaths } from 'ui/routingTools'
import { Par, HorizontalSlider } from 'ui/components'

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

export function UserOverview() {
	const res = useAllUsersQuery()

	// Check if data has loaded properly.
	if (res.loading)
		return <Par>Users are being loaded...</Par>
	if (res.error || !res.data || !res.data.allUsers) {
		return <Par>Oops... The users apparently cannot be loaded.</Par>
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
		<Par>Below you find all users that have ever logged in to Step-Wise, sorted by the date of their last activity.</Par>
		<HorizontalSlider>
			<div className={clsx(classes.userOverview, 'userOverview')}>
				<div className="name head">Name</div>
				<div className="stats head">Skills</div>
				<div className="updatedAt head">Last activity</div>
				<div className="createdAt head">First activity</div>
				<div className="role head">Role</div>
				<div className="email head">Email address</div>

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
