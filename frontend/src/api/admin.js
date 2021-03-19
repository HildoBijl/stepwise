import { useQuery, gql } from '@apollo/client'

// Get the query results. It's recommended not to use this one externally but use the context results, to have a single source of truth. (GraphQL gives flaky results.)
export function useAllUsersQuery(skillIds) {
	return useQuery(ALLUSERS, { variables: { skillIds } })
}
const ALLUSERS = gql`
	query allUsers($skillIds: [String]) {
		allUsers {
			name
			givenName
			familyName
			email
			role
			skills(ids: $skillIds) {
				id
				skillId
				coefficients
				coefficientsOn
				highest
				highestOn
			}
		}
	}
`

export function isAdmin(user) {
	return !!user && user.role === 'admin'
}