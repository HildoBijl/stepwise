import { useQuery, gql } from '@apollo/client'

export function isAdmin(user) {
	return !!user && user.role === 'admin'
}

export function useUserQuery(userId, skillIds) {
	return useQuery(USER, { variables: { userId, skillIds } })
}
const USER = gql`
	query user($userId: ID!, $skillIds: [String]) {
		user(userId: $userId) {
			id
			name
			givenName
			familyName
			email
			role
			createdAt
			updatedAt
			skills(ids: $skillIds) {
				id
				skillId
				numPracticed
				coefficients
				coefficientsOn
				highest
				highestOn
				createdAt
				updatedAt
			}
		}
	}
`

export function useAllUsersQuery(skillIds) {
	return useQuery(ALLUSERS, { variables: { skillIds } })
}
const ALLUSERS = gql`
	query allUsers($skillIds: [String]) {
		allUsers {
			id
			name
			givenName
			familyName
			email
			role
			createdAt
			updatedAt
			skills(ids: $skillIds) {
				id
				skillId
				numPracticed
				coefficients
				coefficientsOn
				highest
				highestOn
				createdAt
				updatedAt
			}
		}
	}
`
