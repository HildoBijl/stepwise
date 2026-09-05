import { gql } from '@apollo/client'

export const PRIVACY_POLICY_CONSENT_FRAGMENT = gql`
	fragment PrivacyPolicyConsentFields on PrivacyPolicyConsent {
		version
		acceptedAt
		isLatestVersion
	}
`

export const USER_FRAGMENTS = gql`
	fragment UserPublicFields on User {
		id
		name
		givenName
		familyName
	}

	fragment UserSharedDataFields on UserSharedData {
		email
	}

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
