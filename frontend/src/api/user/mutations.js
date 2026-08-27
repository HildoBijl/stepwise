import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

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
			${userFields(false, false)}
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

// Delete an account.
export function useDeleteAccountMutation() {
	const [deleteAccount, data] = useMutation(DELETE_ACCOUNT)
	const confirmAccountDeletion = confirmEmail => deleteAccount({ variables: { confirmEmail } })
	return [confirmAccountDeletion, data]
}
const DELETE_ACCOUNT = gql`
	mutation deleteAccount($confirmEmail: String!) {
		deleteAccount(confirmEmail: $confirmEmail)
	}
`
