import React from 'react'

import { useAllUsersQuery } from 'api/admin'
import { Par } from 'ui/components/containers'

export default function About() {
	const res = useAllUsersQuery()

	// Check if data has loaded properly.
	if (res.loading)
		return <Par>Gebruikers worden geladen...</Par>
	if (res.error || !res.data || !res.data.allUsers) {
		console.log(res)
		return <Par>Oops... De gebruikers konden niet geladen worden.</Par>
	}

	// Display the users.
	const allUsers = res.data.allUsers
	return (
		<>
			<Par>Dit is de admin-pagina. Hieronder zie je alle gebruikers.</Par>
			{allUsers.map(user => <Par key={user.email}>{user.name}: {user.role} with {user.skills.length} practiced skills</Par>)}
		</>
	)
}