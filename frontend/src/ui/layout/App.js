import React from 'react'
import { ThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import { ApolloProvider } from '@apollo/client'

import { UserProvider } from 'api/user'
import { ActiveGroupProvider } from 'api/group'
import { SkillCacher } from 'api/skill'
import theme from 'ui/theme'

import Routing from './Routing'

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
					<ActiveGroupProvider>
						<SkillCacher>
							<Routing />
						</SkillCacher>
					</ActiveGroupProvider>
				</UserProvider>
			</ThemeProvider>
		</div>
	)
}

export default withApolloProvider(App)
