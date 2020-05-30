import React from 'react'
import { useHistory } from 'react-router-dom'
import { Button, Typography } from '@material-ui/core'

import { usePaths } from '../routing'

export default function About() {
	const paths = usePaths()
	const history = useHistory()

	return (
		<>
			<Typography variant='body1'>This can be an about page.</Typography>
			<Button variant="contained" color="primary" onClick={() => history.push(paths.history())}>History</Button>
		</>
	)
}
