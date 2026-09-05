import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

// Define the fields we read for the privacy policy consent.
export const privacyPolicyConsentFields = `
	version
	acceptedAt
	isLatestVersion
`

// Define the fields we read for users.
export const userFields = (additionalPrivateFields = '') => {
	const privateFields = `
		email
		${additionalPrivateFields}
	`
	return `
		id
		name
		givenName
		familyName
		... on UserPrivate {
			${privateFields}
		}
		... on UserFull {
			${privateFields}
			role
			language
			privacyPolicyConsent {
				${privacyPolicyConsentFields}
			}
			createdAt
			updatedAt
		}
	`
}

// Get the query results. It's recommended not to use this one externally but use the context results, to have a single source of truth. (GraphQL gives flaky results.)
export function useMeQuery() {
	return useQuery(ME)
}
export const ME = gql`
	{
		me {
			${userFields()}
		}
	}
`
