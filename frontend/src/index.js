import React from 'react'
import ReactDOM from 'react-dom'
import App from './ui/layout/App'
import ApolloClient from 'apollo-boost'

const apolloClient = new ApolloClient({
	uri: `${process.env.REACT_APP_API_ADDRESS}/graphql`,
	credentials: 'include',
})

ReactDOM.render(
	// Disable strict mode to prevent Material UI from bugging out.
	<App apolloClient={apolloClient}/>,
	document.getElementById('root')
)
