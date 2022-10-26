import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client'

import { groupParameters } from './util'

// Group returns the data of a group with the given code.
export function useGroupQuery(code) {
	code = code.toUpperCase()
	return useQuery(GROUP, { variables: { code } })
}
export const GROUP = gql`
	query group($code: String!) {
		group(code: $code) {
			${groupParameters}
		}
	}
`

// GroupExists returns whether the group with the given code already exists.
export function useGroupExistsQuery(code) {
	code = code.toUpperCase()
	return useQuery(GROUP_EXISTS, { variables: { code } })
}
export const GROUP_EXISTS = gql`
	query groupExists($code: String!) {
		groupExists(code: $code)
	}
`

// MyActiveGroup returns the active group of the user, or null if the user is not active in any group.
export function useMyActiveGroupQuery() {
	return useQuery(MY_ACTIVE_GROUP)
}
export const MY_ACTIVE_GROUP = gql`
	{
		myActiveGroup {
			${groupParameters}
		}
	}
`

// MyGroups returns all the groups the user is a member of.
export function useMyGroupsQuery() {
	return useQuery(MY_GROUPS)
}
export const MY_GROUPS = gql`
	{
		myGroups {
			${groupParameters}
		}
	}
`
