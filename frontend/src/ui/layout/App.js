import '../style.scss'

import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import { ThemeProvider } from '@material-ui/core/styles'

import theme from '../theme'
import routes from '../routes'
import { Home, Exercises, Feedback, About } from '../pages'

function App() {
	return (
		<div className='app'>
			<ThemeProvider theme={theme}>
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
			</ThemeProvider>
		</div>
	)
}

export default App
