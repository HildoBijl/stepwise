import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { Language } from '@step-wise/settings'

import type { CurrentUser, PrivacyPolicyConsent } from './types.ts'
import { CURRENT_USER_QUERY, getUserFields, privacyPolicyConsentFields } from './queries.ts'

type SetLanguageData = { setLanguage: CurrentUser }
type SetLanguageVariables = { language: Language }

const SET_LANGUAGE_MUTATION = gql`
	mutation setLanguage($language: String!) {
		setLanguage(language: $language) {
			${getUserFields()}
		}
	}
`

export function useSetLanguageMutation() {
	const [setLanguage, result] = useMutation<SetLanguageData, SetLanguageVariables>(SET_LANGUAGE_MUTATION)
	return [(language: Language) => setLanguage({ variables: { language } }), result] as const
}

type AcceptLatestPrivacyPolicyData = { acceptLatestPrivacyPolicy: PrivacyPolicyConsent }
type CurrentUserQueryData = { me: CurrentUser | null }

const ACCEPT_LATEST_PRIVACY_POLICY_MUTATION = gql`
	mutation acceptLatestPrivacyPolicy {
		acceptLatestPrivacyPolicy {
			${privacyPolicyConsentFields}
		}
	}
`

export function useAcceptLatestPrivacyPolicyMutation() {
	return useMutation<AcceptLatestPrivacyPolicyData>(ACCEPT_LATEST_PRIVACY_POLICY_MUTATION, {
		update: (cache, { data }) => {
			const privacyPolicyConsent = data?.acceptLatestPrivacyPolicy
			if (!privacyPolicyConsent) return

			const currentUserData = cache.readQuery<CurrentUserQueryData>({ query: CURRENT_USER_QUERY })
			if (!currentUserData?.me) return
			cache.writeQuery<CurrentUserQueryData>({
				query: CURRENT_USER_QUERY,
				data: {
					me: { ...currentUserData.me, privacyPolicyConsent },
				},
			})
		},
	})
}

type DeleteAccountData = { deleteAccount: string }
type DeleteAccountVariables = { confirmEmail: string }

const DELETE_ACCOUNT_MUTATION = gql`
	mutation deleteAccount($confirmEmail: String!) {
		deleteAccount(confirmEmail: $confirmEmail)
	}
`

export function useDeleteAccountMutation() {
	const [deleteAccount, result] = useMutation<DeleteAccountData, DeleteAccountVariables>(DELETE_ACCOUNT_MUTATION)
	return [(confirmEmail: string) => deleteAccount({ variables: { confirmEmail } }), result] as const
}
