import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { Language } from '@step-wise/settings'

import type { CurrentUserRecord } from '../records.ts'
import { currentUserRecordToUser } from '../conversion.ts'
import { USER_FRAGMENTS } from '../fragments.ts'

type SetLanguageData = { setLanguage: CurrentUserRecord }
type SetLanguageVariables = { language: Language }

const SET_LANGUAGE_MUTATION: TypedDocumentNode<SetLanguageData, SetLanguageVariables> = gql`
	mutation setLanguage($language: String!) {
		setLanguage(language: $language) {
			...UserPublicFields
			...UserPrivateFields
			...UserFullFields
		}
	}
	${USER_FRAGMENTS}
`

export function useSetLanguageMutation() {
	const [setLanguage, result] = useMutation(SET_LANGUAGE_MUTATION)
	return [
		async (language: Language) => {
			const mutationResult = await setLanguage({ variables: { language } })
			return {
				...mutationResult,
				data: mutationResult.data && { setLanguage: currentUserRecordToUser(mutationResult.data.setLanguage) },
			}
		},
		{
			...result,
			data: result.data && { setLanguage: currentUserRecordToUser(result.data.setLanguage) },
		},
	] as const
}
