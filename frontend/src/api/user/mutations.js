import { useMutation, gql } from '@apollo/client'

import { privacyPolicyConsentFields, userFields, ME } from './queries'

// Set the language.
export function useSetLanguageMutation() {
	const [setLanguage, data] = useMutation(SET_LANGUAGE)
	const newSetLanguage = language => setLanguage({ variables: { language } })
	return [newSetLanguage, data]
}
const SET_LANGUAGE = gql`
	mutation setLanguage($language: String!) {
		setLanguage(language: $language) {
			${userFields}
		}
	}
`

// Accept the latest privacy policy.
export function useAcceptLatestPrivacyPolicyMutation() {
	const [acceptLatestPrivacyPolicy, data] = useMutation(ACCEPT_LATEST_PRIVACY_POLICY, {
		update: (cache, { data: { acceptLatestPrivacyPolicy } }) => {
			// On an update, directly update the cache too.
			const { me } = cache.readQuery({ query: ME })
			cache.writeQuery({
				query: ME,
				data: {
					me: {
						...me,
						privacyPolicyConsent: {
							...acceptLatestPrivacyPolicy,
						},
					},
				},
			})
		},
	})
	return [acceptLatestPrivacyPolicy, data]
}
const ACCEPT_LATEST_PRIVACY_POLICY = gql`
	mutation acceptLatestPrivacyPolicy {
		acceptLatestPrivacyPolicy {
			${privacyPolicyConsentFields}
		}
	}
`

// Shut down (delete) an account.
export function useShutdownAccountMutation() {
	const [shutdownAccount, data] = useMutation(SHUTDOWN_ACCOUNT)
	const newShutdownAccount = (confirmEmail) => shutdownAccount({ variables: { confirmEmail } })
	return [newShutdownAccount, data]
}
const SHUTDOWN_ACCOUNT = gql`
	mutation shutdownAccount($confirmEmail: String!) {
		shutdownAccount(confirmEmail: $confirmEmail)
	}
`
