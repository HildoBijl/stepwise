import { useCallback } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { PrivacyPolicyConsentRecord } from '../records.ts'
import type { UseAcceptLatestPrivacyPolicyResult } from '../types.ts'
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

export function useAcceptLatestPrivacyPolicy(): UseAcceptLatestPrivacyPolicyResult {
	const [mutate, { loading, error }] = useMutation(ACCEPT_LATEST_PRIVACY_POLICY_MUTATION)
	const acceptLatestPrivacyPolicy = useCallback(async () => { await mutate() }, [mutate])
	return [acceptLatestPrivacyPolicy, { loading, error }] as const
}
