import React from 'react'
import { useRouteMatch, Switch, Route } from 'react-router-dom'

import Exercise from './Exercise'
import ExercisesOverview from './ExercisesOverview'

export default function Exercises() {
  const match = useRouteMatch()

	return (
		<Switch>
			<Route path={`${match.path}/:exerciseId`}>
				<Exercise />
			</Route>
			<Route path={match.path}>
				<ExercisesOverview />
			</Route>
		</Switch>
	)
}
