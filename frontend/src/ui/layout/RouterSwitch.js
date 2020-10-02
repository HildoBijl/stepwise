import React from 'react'
import { Switch, Route } from 'react-router-dom'

import { RouteContext } from 'ui/routing'

import Page from './Page'

export default function RouterSwitch({ children, parent = null }) {
	// Set up the contents for the route switch. For this, first add routes for all the children. If none of them are found, add a route for the parent itself if present.
	const contents = (
		<Switch>
			{children && Object.keys(children).map(key => (
				<Route key={key} path={children[key].path}>
					<RouterSwitch children={children[key].children} parent={children[key]} />
				</Route>
			))}
			{parent && (
				<Route path={parent.path}>
					<RouteContext.Provider value={parent}>
						<Page />
					</RouteContext.Provider>
				</Route>
			)}
		</Switch>
	)

	// Add the provider of the parent if it has one.
	if (parent && parent.provider)
		return <parent.provider>{contents}</parent.provider>
	return contents
}
