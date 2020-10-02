import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'

import { useRoutes } from 'ui/routing'

import RouterSwitch from './RouterSwitch'

export default function Routing() {
	const routes = useRoutes() // Get the routes of the main website structure.

	return (
		<Router>
			<RouterSwitch children={routes} parent={null} />
		</Router>
	)
}
