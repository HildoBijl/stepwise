import React from 'react'
import { Link } from 'react-router-dom'

import { useAllUsersQuery } from 'api/admin'
import { Par } from 'ui/components/containers'
import { usePaths } from 'ui/routing'

export default function UserOverview() {
	const res = useAllUsersQuery()
	const paths = usePaths()

	// Check if data has loaded properly.
	if (res.loading)
		return <Par>Gebruikers worden geladen...</Par>
	if (res.error || !res.data || !res.data.allUsers) {
		console.log(res)
		return <Par>Oops... De gebruikers konden niet geladen worden.</Par>
	}

	// Display the users.
	const allUsers = res.data.allUsers
	console.log(allUsers)
	return (
		<>
			<Par>Dit is de admin-pagina. Hieronder zie je alle gebruikers.</Par>
			{allUsers.map(user => <Par key={user.email}>
				<Link to={paths.userInspection({ userId: user.id })}>{user.name}</Link>: {user.role} with {user.skills.length} practiced skills
				</Par>)}
		</>
	)
}