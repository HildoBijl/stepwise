import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './ui/layout/App'
import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import { WebSocketLink } from '@apollo/client/link/ws'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { graphqlAddress, graphqlWebsocketAddress } from './ui/settings'

// The websocket link, for subscriptions.
const wsLink = new WebSocketLink(
	new SubscriptionClient(
		graphqlWebsocketAddress,
		{
			reconnect: true,
		},
	)
)

// The HTTP link, for regular queries/mutations.
const httpLink = createHttpLink({
	uri: graphqlAddress,
	credentials: 'include',
})

// Apollo Client.
const apolloClient = new ApolloClient({
	link: split(
		({ query }) => {
			const definition = getMainDefinition(query)
			return (
				definition.kind === 'OperationDefinition' &&
				definition.operation === 'subscription'
			)
		},
		wsLink,
		httpLink,
	),
	cache: new InMemoryCache(),
})

// React. Do not use strict mode to prevent Material UI from bugging out.
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App apolloClient={apolloClient} />)

// Service worker.
serviceWorkerRegistration.register()
