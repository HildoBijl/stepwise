import React from 'react'
import ReactDOM from 'react-dom'
import App from './ui/layout/App'
import ApolloClient from 'apollo-boost'
import { ApolloProvider } from '@apollo/react-hooks'

const client = new ApolloClient({
	uri: process.env.REACT_APP_API_ADDRESS,
})

ReactDOM.render(
	<React.Fragment> {/* Disable strict mode to prevent Material UI from bugging out. */}
		<ApolloProvider client={client}>
			<App />
		</ApolloProvider>
	</React.Fragment>,
	document.getElementById('root')
)
