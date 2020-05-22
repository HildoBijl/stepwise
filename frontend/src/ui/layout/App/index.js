import './style.scss'

import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import routes from '../../routes'
import { Home, Exercises, Feedback, About } from '../../pages'

function App() {
	return (
		<div className='app'>
			<Router>
				<Switch>
					<Route path={routes.EXERCISES}>
						<Exercises />
					</Route>
					<Route path={routes.FEEDBACK}>
						<Feedback />
					</Route>
					<Route path={routes.ABOUT}>
						<About />
					</Route>
					<Route path={routes.HOME}>
						<Home />
					</Route>
				</Switch>
			</Router>
		</div>
	)
}

export default App
