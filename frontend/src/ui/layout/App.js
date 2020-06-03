import '../style.scss'

import React from 'react'
import { ThemeProvider } from '@material-ui/core/styles'
import { ApolloProvider } from '@apollo/react-hooks'

import Routing from './Routing'
import theme from '../theme'
import { UserContext, useUserQuery } from '../user'

const withApolloProvider = WrappedComponent => props => (
	<ApolloProvider client={props.apolloClient}>
		<WrappedComponent { ...props } />
	</ApolloProvider>
)

function App() {
	const result = useUserQuery()
	return (
		<div className='app'>
			<ThemeProvider theme={theme}>
				<UserContext.Provider value={result}>
					<Routing />
				</UserContext.Provider>
			</ThemeProvider>
		</div>
	)
}

export default withApolloProvider(App)
