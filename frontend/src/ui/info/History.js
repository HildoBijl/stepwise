import React from 'react'

import { Typography } from '@material-ui/core'
import { useUser } from '../../api/user'

export default function History() {
	const user = useUser()

	return (
		<>
			<Typography variant='body1'>This is a dummy page to test sub-pages.</Typography>
			<Typography variant='body1'>The user's name is {user ? user.name : 'unknown: he is not logged in'}.</Typography>
		</>
	)
}
