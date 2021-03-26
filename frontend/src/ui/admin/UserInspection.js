import React from 'react'
import { useRouteMatch } from 'react-router-dom'

import { useUserQuery } from 'api/admin'
import { Par } from 'ui/components/containers'

export default function UserInspection() {
	const { params } = useRouteMatch()
	const res = useUserQuery(params && params.userId)

	// Check if data has loaded properly.
	if (res.loading)
		return <Par>Gebruiker wordt opgezocht...</Par>
	if (res.error || !res.data)
		return <Par>Oops... Er ging iets mis bij het opzoeken van de gebruiker.</Par>
	const user = res.data.user
	if (!user)
		return <Par>Oops... De gebruiker kon niet gevonden worden. Hij bestaat niet.</Par>

	// Display the user.
	return <Par>Test: dit komt nog. {user.name}</Par>
}

export function useUserInspectionTitle() {
	const { params } = useRouteMatch()
	const res = useUserQuery(params && params.userId)
	if (res.loading)
		return ''
	if (res.error || !res.data)
		return 'Oops...'
	const user = res.data.user
	if (!user)
		return 'Onbekende gebruiker'
	return user.name
}