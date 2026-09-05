import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client'
import { HttpLink } from '@apollo/client/link/http'
import { RetryLink } from '@apollo/client/link/retry'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'

import { graphqlAddress, graphqlWebsocketAddress } from '../settings'

export function createApolloClient() {
	const wsLink = new GraphQLWsLink(createClient({
		url: graphqlWebsocketAddress,
		retryAttempts: Infinity,
		shouldRetry: () => true,
	}))

	const httpLink = new HttpLink({
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

	return new ApolloClient({
		link: ApolloLink.split(
			({ query }) => {
				const definition = getMainDefinition(query)
				return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
			},
			wsLink,
			ApolloLink.from([retryLink, httpLink]),
		),
		cache: new InMemoryCache({
			typePolicies: {
				User: {
					fields: {
						sharedData: { merge: true },
						accountData: { merge: true },
					},
				},
				Course: {
					fields: {
						accessData: { merge: true },
						teacherData: { merge: true },
					},
				},
				CourseAccessData: { keyFields: false },
				CourseTeacherData: { keyFields: false },
				Skill: {
					keyFields: ['userId', 'skillId'],
					fields: {
						exerciseData: { merge: true },
					},
				},
				SkillExerciseData: { keyFields: false },
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
			},
		}),
	})
}
