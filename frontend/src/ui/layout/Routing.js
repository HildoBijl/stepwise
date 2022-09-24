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
function renderRoutes(pages) {
	return Object.values(pages).map(page => renderPageRoutes(page)).flat()
}

function renderPageRoutes(page) {
	let result = []

	// Add the children first, as they should trigger first if their path matches.
	if (page.children)
		result = renderRoutes(page.children)

	// Add the page itself. Include a context to set inform the page of the route used.
	result.push(<Route key={page.path} path={page.path} element={
		<RouteContext.Provider value={page}>
			<Page />
		</RouteContext.Provider>
	} />)
	return result
}
