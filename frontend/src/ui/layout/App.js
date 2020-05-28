import '../style.scss'

import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { ThemeProvider } from '@material-ui/core/styles'
import { Helmet } from 'react-helmet'

import theme from '../theme'
import routes from '../routes'
import { Home, Exercises, Feedback, About } from '../pages'

const MetaTitle = ({ children }) => <Helmet><title>{children}</title></Helmet>
const websiteTitle = 'Step-wise'
const addendum = ` | ${websiteTitle}`

export default function App() {
	return (
		<div className='app'>
			<ThemeProvider theme={theme}>
				<Router>
					<Switch>
						<Route path={routes.exercises}>
							<Exercises />
							<MetaTitle>Exercises{addendum}</MetaTitle>
						</Route>
						<Route path={routes.feedback}>
							<Feedback />
							<MetaTitle>Feedback{addendum}</MetaTitle>
						</Route>
						<Route path={routes.about}>
							<About />
							<MetaTitle>About{addendum}</MetaTitle>
						</Route>
						<Route path={routes.home}>
							<Home />
							<MetaTitle>{websiteTitle} | Your own private tutor</MetaTitle>
						</Route>
					</Switch>
				</Router>
			</ThemeProvider>
		</div>
	)
}
