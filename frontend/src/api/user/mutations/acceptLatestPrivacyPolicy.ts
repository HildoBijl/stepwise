import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { PrivacyPolicyConsentRecord } from '../records.ts'
import { PRIVACY_POLICY_CONSENT_FRAGMENT } from '../fragments.ts'

type AcceptLatestPrivacyPolicyData = {
	acceptLatestPrivacyPolicy: {
		id: string
		accountData: { privacyPolicyConsent: PrivacyPolicyConsentRecord }
	}
}

const ACCEPT_LATEST_PRIVACY_POLICY_MUTATION: TypedDocumentNode<AcceptLatestPrivacyPolicyData, Record<string, never>> = gql`
	mutation acceptLatestPrivacyPolicy {
		acceptLatestPrivacyPolicy {
			id
			accountData {
				privacyPolicyConsent {
					...PrivacyPolicyConsentFields
				}
			}
		}
	}
	${PRIVACY_POLICY_CONSENT_FRAGMENT}
`

export function useAcceptLatestPrivacyPolicyMutation() {
	const [mutate, { loading, error }] = useMutation(ACCEPT_LATEST_PRIVACY_POLICY_MUTATION)
	return [
		async () => { await mutate() },
		{ loading, error },
	] as const
}
