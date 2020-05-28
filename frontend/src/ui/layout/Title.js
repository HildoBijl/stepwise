import React from 'react'
import Typography from '@material-ui/core/Typography'
import { Switch, Route } from 'react-router-dom'

import routes from '../routes'

export default function Title({ className }) {
	return (
		<Typography variant="h6" className={className}>
			<Switch>
				<Route path={routes.exercises}>
					Exercises
				</Route>
				<Route path={routes.feedback}>
					Feedback
				</Route>
				<Route path={routes.about}>
					About
				</Route>
				<Route path={routes.home}>
					Step-wise
				</Route>
			</Switch>
		</Typography>
	)
}
