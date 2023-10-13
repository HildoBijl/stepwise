import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { useRoutes, RouteContext } from 'ui/routing'

import Page from './Page'

export default function Routing() {
	const routes = useRoutes() // Get the routes of the main website structure.
	return (
		<Router>
			<Routes>
				{renderRoutes(routes)}
				<Route path="*" />
			</Routes>
		</Router>
	)
}

// getRoutes returns an array of Route objects for each of the possible pages.
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
