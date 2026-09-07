import { gql } from '@apollo/client'

export const PRIVACY_POLICY_CONSENT_FRAGMENT = gql`
	fragment PrivacyPolicyConsentFields on PrivacyPolicyConsent {
		version
		acceptedAt
		isLatestVersion
	}
`

export const USER_PUBLIC_FRAGMENT = gql`
	fragment UserPublicFields on User {
		id
		name
		givenName
		familyName
	}
`

export const USER_SHARED_DATA_FRAGMENT = gql`
	fragment UserSharedDataFields on UserSharedData {
		email
	}
`

export const USER_ACCOUNT_DATA_FRAGMENT = gql`
	fragment UserAccountDataFields on UserAccountData {
		role
		language
		privacyPolicyConsent {
			...PrivacyPolicyConsentFields
		}
		createdAt
		updatedAt
	}

	${PRIVACY_POLICY_CONSENT_FRAGMENT}
`

export const USER_FRAGMENTS = gql`
	${USER_PUBLIC_FRAGMENT}
	${USER_SHARED_DATA_FRAGMENT}
	${USER_ACCOUNT_DATA_FRAGMENT}
`
