import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Box } from '@mui/material'

import { useAllUsers } from 'api'
import { usePaths } from 'ui/routingTools'
import { Par, HorizontalSlider, TimeAgo } from 'ui/components'

export function UserOverview() {
	const { users, loading, error } = useAllUsers()

	// Check if data has loaded properly.
	if (loading)
		return <Par>Users are being loaded...</Par>
	if (error || !users) {
		return <Par>Oops... The users apparently cannot be loaded.</Par>
	}

	// All loaded!
	return <UserOverviewWithData allUsers={users} />
}

function UserOverviewWithData({ allUsers }) {
	const sortedUsers = useMemo(() => [...allUsers].sort((a, b) => b.lastActiveAt - a.lastActiveAt), [allUsers])

	return <>
		<Par>Below you find all users that have ever signed in to Step-Wise, sorted by the date of their last activity.</Par>
		<HorizontalSlider>
			<Box sx={{
				display: 'grid',
				gridGap: '0.5rem 0.8rem',
				gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr',
				placeItems: 'center stretch',
				width: '100%',
				'& .head': { fontWeight: 'bold' },
				'& .name': { width: '120px' },
				'& .email': { width: '220px' },
				'& .role': { width: '80px', textAlign: 'center' },
				'& .lastActiveAt': { width: '80px', textAlign: 'center' },
				'& .createdAt': { width: '80px', textAlign: 'center' },
			}} className="userOverview">
				<div className="name head">Name</div>
				<div className="lastActiveAt head">Last activity</div>
				<div className="createdAt head">First activity</div>
				<div className="role head">Role</div>
				<div className="email head">Email address</div>

				{sortedUsers.map(user => <UserOverviewItem key={user.id} user={user} />)}
			</Box>
		</HorizontalSlider>
	</>
}

function UserOverviewItem({ user }) {
	const paths = usePaths()
	return <>
		<div className="name"><Link to={paths.userInspection({ userId: user.id })}>{user.name}</Link></div>
		<div className="lastActiveAt"><TimeAgo date={user.lastActiveAt} displayMinutes={false} addAgo={true} /></div>
		<div className="createdAt"><TimeAgo date={user.createdAt} displayMinutes={false} addAgo={true} /></div>
		<div className="role">{user.role === 'admin' ? 'Admin' : (user.role === 'teacher' ? 'Docent' : 'Student')}</div>
		<div className="email">{user.email}</div>
	</>
}
