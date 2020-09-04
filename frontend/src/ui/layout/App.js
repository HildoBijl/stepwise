import '../style.scss'

import React from 'react'
import { ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import { ApolloProvider } from '@apollo/react-hooks'

import Routing from './Routing'
import theme from '../theme'
import { UserProvider } from '../api/user'
import SkillCacher from './SkillCacher'

const withApolloProvider = WrappedComponent => props => (
	<ApolloProvider client={props.apolloClient}>
		<WrappedComponent {...props} />
	</ApolloProvider>
)

function App() {
	return (
		<div id='app'>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<UserProvider>
					<SkillCacher>
						<Routing />
					</SkillCacher>
				</UserProvider>
			</ThemeProvider>
		</div>
	)
}

export default withApolloProvider(App)
