import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client'
import { useEffect } from 'react';

const MY_GROUPS = gql`
	{
		myGroups {
			code
			members {
				name
			}
		}
	}
`

export function useMyGroupsQuery() {
	return useQuery(MY_GROUPS)
}

const GROUP = gql`
	query group($code: String!) {
		group(code: $code) {
			code
			members {
				name
			}
		}
	}
`

export function useGroupQuery(code) {
	return useQuery(GROUP, { variables: { code }})
}

const GROUP_UPDATED = gql`
	subscription groupUpdated($code: String!) {
		groupUpdated(code: $code) {
			code
			members {
				name
			}
		}
	}
`

export function useGroupSubscription(code, subscribeToMore) {
	useEffect(() => {
		subscribeToMore({
			document: GROUP_UPDATED,
			variables: { code },
			updateQuery: (prev, { subscriptionData }) => {
				if (!subscriptionData.data) {
					return prev
				}
				const res = {
					...prev.group,
					...subscriptionData.data.groupUpdated,
				}
				return { group: res }
			}
		})
	}, [code, subscribeToMore])
}
