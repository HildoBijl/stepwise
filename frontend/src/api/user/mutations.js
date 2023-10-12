import { useMutation, gql } from '@apollo/client'

import { userFields } from './queries'

// Set the language.
export function useSetLanguageMutation() {
	const [setLanguage, data] = useMutation(SET_LANGUAGE)
	const newSetLanguage = language => setLanguage({ variables: { language }})
	return [newSetLanguage, data]
}
const SET_LANGUAGE = gql`
	mutation setLanguage($language: String!) {
		setLanguage(language: $language) {
			${userFields}
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
