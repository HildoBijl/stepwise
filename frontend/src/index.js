import React from 'react'
import ReactDOM from 'react-dom/client'
import { ApolloClient, InMemoryCache, createHttpLink, from, split } from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { RetryLink } from '@apollo/client/link/retry'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'

import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import { graphqlAddress, graphqlWebsocketAddress } from './settings'
import { App } from './ui/layout'

// The websocket link, for subscriptions.
const wsLink = new GraphQLWsLink(createClient({
	url: graphqlWebsocketAddress,
	retryAttempts: Infinity,
	shouldRetry: () => true,
}))

// The HTTP link, for regular queries/mutations.
const httpLink = createHttpLink({
	uri: graphqlAddress,
	credentials: 'include',
})

// Retry queries that fail while the API is starting or restarting. Mutations are deliberately excluded because retrying them could perform an action twice.
const retryLink = new RetryLink({
	delay: {
		initial: 300,
		max: 3000,
		jitter: true,
	},
	attempts: {
		max: Infinity,
		retryIf: (error, operation) => {
			const definition = getMainDefinition(operation.query)
			return definition.kind === 'OperationDefinition' && definition.operation === 'query'
		},
	},
})

// Apollo Client.
const apolloClient = new ApolloClient({
	link: split(
		({ query }) => {
			const definition = getMainDefinition(query)
			return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
		},
		wsLink,
		from([retryLink, httpLink]),
	),
	cache: new InMemoryCache({
		typePolicies: {
			SkillWithExercises: {
				keyFields: ['userId', 'skillId'],
			},
			SkillWithoutExercises: {
				keyFields: ['userId', 'skillId'],
			},
			Group: {
				keyFields: ['code'],
				fields: {
					members: { merge: false },
				},
			},
			GroupEvent: {
				fields: {
					actions: { merge: false },
				},
			},
			GroupMember: { keyFields: ['groupId', 'userId'] },
			Query: {
				fields: {
					myGroups: { merge: false },
				},
			},
			StudentCourse: { // Define custom merge functions to prevent warnings from Apollo on updates.
				fields: {
					teachers: { merge(existing, incoming) { return incoming } },
				},
			},
			TeacherCourse: {
				fields: {
					students: { merge(existing, incoming) { return incoming } },
					teachers: { merge(existing, incoming) { return incoming } },
				},
			},
		},
	}),
})

// React. Do not use strict mode to prevent Material UI from bugging out.
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App apolloClient={apolloClient} />)

// Service worker.
serviceWorkerRegistration.register()
