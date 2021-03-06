import React from 'react'
import ReactDOM from 'react-dom'
import App from './ui/layout/App'
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'

// Apollo Client.
const apolloClient = new ApolloClient({
	link: createHttpLink({
		uri: `${process.env.REACT_APP_API_ADDRESS}/graphql`,
		credentials: 'include',
	}),
	cache: new InMemoryCache(),
})

// React. Do not use strict mode to prevent Material UI from bugging out.
ReactDOM.render(<App apolloClient={apolloClient} />, document.getElementById('root'))

// Service worker.
serviceWorkerRegistration.register()
