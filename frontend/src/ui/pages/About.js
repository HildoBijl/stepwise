import React from 'react'
import { useHistory } from 'react-router-dom'
import { Button, Typography } from '@material-ui/core'
import { usePaths } from '../routing'

import { Unit } from 'step-wise/edu/util/inputTypes/Unit'

export default function About() {
	const paths = usePaths()
	const history = useHistory()

	const a = new Unit('kg^2 * dam^3 * dC / kg^2 * dN^1')
	console.log(a)
	console.log(a.str)
	a.simplify()
	console.log(a.str)

	return (
		<>
			<Typography variant='body1'>This can be an about page.</Typography>
			<Button variant="contained" color="primary" onClick={() => history.push(paths.history())}>History</Button>
		</>
	)
}