import { useCallback } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { Language } from '@step-wise/settings'

import type { UseSetLanguageResult } from '../types.ts'

type SetLanguageData = {
	setLanguage: {
		id: string
		accountData: { language: Language | null }
	}
}
type SetLanguageVariables = { language: Language }

const SET_LANGUAGE_MUTATION: TypedDocumentNode<SetLanguageData, SetLanguageVariables> = gql`
	mutation setLanguage($language: String!) {
		setLanguage(language: $language) {
			id
			accountData {
				language
			}
		}
	}
`

export function useSetLanguage(): UseSetLanguageResult {
	const [mutate, { loading, error }] = useMutation(SET_LANGUAGE_MUTATION)
	const setLanguage = useCallback(async (language: Language) => { await mutate({ variables: { language } }) }, [mutate])
	return [setLanguage, { loading, error }] as const
}
