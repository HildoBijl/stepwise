import React from 'react'
import ReactDOM from 'react-dom'
import App from './ui/layout/App'
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const apolloClient = new ApolloClient({
	link: createHttpLink({
		uri: `${process.env.REACT_APP_API_ADDRESS}/graphql`,
		credentials: 'include',
	}),
	cache: new InMemoryCache(),
})

ReactDOM.render(
	// Disable strict mode to prevent Material UI from bugging out.
	<App apolloClient={apolloClient}/>,
	document.getElementById('root')
)
