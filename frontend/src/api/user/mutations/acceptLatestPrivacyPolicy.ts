import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { CurrentUserRecord, PrivacyPolicyConsentRecord } from '../records.ts'
import { privacyPolicyConsentRecordToConsent } from '../conversion.ts'
import { PRIVACY_POLICY_CONSENT_FRAGMENT } from '../fragments.ts'
import { CURRENT_USER_QUERY } from '../queries.ts'

type AcceptLatestPrivacyPolicyData = { acceptLatestPrivacyPolicy: PrivacyPolicyConsentRecord }
type CurrentUserQueryData = { me: CurrentUserRecord | null }

const ACCEPT_LATEST_PRIVACY_POLICY_MUTATION: TypedDocumentNode<AcceptLatestPrivacyPolicyData, Record<string, never>> = gql`
	mutation acceptLatestPrivacyPolicy {
		acceptLatestPrivacyPolicy {
			...PrivacyPolicyConsentFields
		}
	}
	${PRIVACY_POLICY_CONSENT_FRAGMENT}
`

export function useAcceptLatestPrivacyPolicyMutation() {
	const [acceptLatestPrivacyPolicy, result] = useMutation(ACCEPT_LATEST_PRIVACY_POLICY_MUTATION, {
		update: (cache, { data }) => {
			const privacyPolicyConsent = data?.acceptLatestPrivacyPolicy
			if (!privacyPolicyConsent) return

			const currentUserData = cache.readQuery<CurrentUserQueryData>({ query: CURRENT_USER_QUERY })
			if (!currentUserData?.me) return
			cache.writeQuery<CurrentUserQueryData>({
				query: CURRENT_USER_QUERY,
				data: {
					me: {
						...currentUserData.me,
						accountData: { ...currentUserData.me.accountData, privacyPolicyConsent },
					},
				},
			})
		},
	})
	return [
		async () => {
			const mutationResult = await acceptLatestPrivacyPolicy()
			return {
				...mutationResult,
				data: mutationResult.data && {
					acceptLatestPrivacyPolicy: privacyPolicyConsentRecordToConsent(mutationResult.data.acceptLatestPrivacyPolicy),
				},
			}
		},
		{
			...result,
			data: result.data && {
				acceptLatestPrivacyPolicy: privacyPolicyConsentRecordToConsent(result.data.acceptLatestPrivacyPolicy),
			},
		},
	] as const
}
