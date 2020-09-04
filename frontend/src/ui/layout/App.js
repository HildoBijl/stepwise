import '../style.scss'

import React from 'react'
import { ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import { ApolloProvider } from '@apollo/react-hooks'

import Routing from './Routing'
import theme from '../theme'
import { UserContext, useUserQuery } from '../api/user'
import SkillCacher from './SkillCacher'

const withApolloProvider = WrappedComponent => props => (
	<ApolloProvider client={props.apolloClient}>
		<WrappedComponent {...props} />
	</ApolloProvider>
)

function App() {
	const result = useUserQuery() // ToDo: turn this into a UserProvider object made in the API.
	return (
		<div id='app'>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<UserContext.Provider value={result}>
					<SkillCacher>
						<Routing />
					</SkillCacher>
				</UserContext.Provider>
			</ThemeProvider>
		</div>
	)
}

export default withApolloProvider(App)
