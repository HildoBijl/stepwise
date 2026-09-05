import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import type { CurrentUser } from './types.ts'

export const privacyPolicyConsentFields = `
	version
	acceptedAt
	isLatestVersion
`

export function getUserFields(additionalPrivateFields = ''): string {
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

type CurrentUserQueryData = {
	me: CurrentUser | null
}

export const CURRENT_USER_QUERY = gql`
	query currentUser {
		me {
			${getUserFields()}
		}
	}
`

export function useCurrentUserQuery() {
	return useQuery<CurrentUserQueryData>(CURRENT_USER_QUERY)
}
