import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { Language } from '@step-wise/settings'

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

export function useSetLanguageMutation() {
	const [mutate, { loading, error }] = useMutation(SET_LANGUAGE_MUTATION)
	return [
		async (language: Language) => { await mutate({ variables: { language } }) },
		{ loading, error },
	] as const
}
