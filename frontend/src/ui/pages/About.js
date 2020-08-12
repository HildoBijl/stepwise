import React from 'react'
import { useHistory } from 'react-router-dom'
import { Button, Typography } from '@material-ui/core'
import { usePaths } from '../routing'

export default function About() {
	const paths = usePaths()
	const history = useHistory()

	return (
		<>
			<Typography variant='body1'>Dit is een info-pagina.</Typography>
			<div style={{ margin: '0.8rem 0'}}><Button variant="contained" color="secondary" onClick={() => history.push(paths.history())}>Geschiedenis</Button></div>
			<div style={{ margin: '0.8rem 0'}}><Button variant="contained" color="primary" onClick={() => history.push(paths.skillTrackerExplainer())}>Over de skill tracker</Button></div>
		</>
	)
}