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

	fragment UserPrivateFields on UserSemiPrivate {
		email
	}

	fragment UserFullFields on UserFull {
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
