import React, { useMemo } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { useUser } from 'api/user'
import { RoutesContext, RouteContext, getPaths } from 'ui/routingTools'

import Page from './Page'
import { getRoutes } from './routes'

export function Routing() {
	const routes = useRoutes() // Get the routes of the main website structure.
	const paths = useMemo(() => getPaths(routes), [routes])
	return (
		<RoutesContext.Provider value={{ routes, paths }}>
			<Router>
				<Routes>
					{renderRoutes(routes)}
					<Route path="*" />
				</Routes>
			</Router>
		</RoutesContext.Provider>
	)
}

// useRoutes is used to access the current routes: the map of all pages on this site.
function useRoutes() {
	const user = useUser()
	const routes = useMemo(() => getRoutes(user), [user])
	return routes
}

// renderRoutes will, for a given routes object, render the React Route component with the right parameters.
function renderRoutes(routes) {
	return Object.values(routes).map(route => renderPageRoutes(route)).flat()
}

function renderPageRoutes(route) {
	let result = []

	// Add the children first, as they should trigger first if their path matches.
	if (route.children)
		result = renderRoutes(route.children)

	// Add the page itself. Include a context to inform the page of the route used.
	result.push(<Route key={route.path} path={route.path} element={
		<RouteContext.Provider value={route}>
			<Page />
		</RouteContext.Provider>
	} />)
	return result
}
