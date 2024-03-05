import { useQuery, gql } from '@apollo/client'

// Define the fields we read for the privacy policy consent.
export const privacyPolicyConsentFields = `
	version
	acceptedAt
	isLatestVersion
`

// Define the fields we read for users.
export const userFields = `
	id
	name
	email
	givenName
	familyName
	role
	language
	privacyPolicyConsent {
		${privacyPolicyConsentFields}
	}
`

// Get the query results. It's recommended not to use this one externally but use the context results, to have a single source of truth. (GraphQL gives flaky results.)
export function useUserQuery() {
	return useQuery(ME)
}
export const ME = gql`
	{
		me {
			${userFields}
		}
	}
`
